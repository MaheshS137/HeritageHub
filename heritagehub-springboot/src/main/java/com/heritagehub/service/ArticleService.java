package com.heritagehub.service;

import com.heritagehub.model.Account;
import com.heritagehub.model.Article;
import com.heritagehub.model.ArticleStatus;
import com.heritagehub.model.District;
import com.heritagehub.model.Role;
import com.heritagehub.repository.ArticleRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class ArticleService {

    private static final Map<String, String> CATEGORY_TITLES = Map.of(
            "festivals-celebrations", "Festivals and Celebrations",
            "traditional-arts", "Traditional Arts",
            "folk-music-dance", "Folk Music and Dance",
            "historical-monuments", "Historical Monuments",
            "food-cuisine", "Food and Cuisine",
            "handicrafts-textiles", "Handicrafts and Textiles",
            "customs-traditions", "Customs and Traditions"
    );

    private final ArticleRepository articleRepository;
    private final DistrictService districtService;

    public ArticleService(ArticleRepository articleRepository, DistrictService districtService) {
        this.articleRepository = articleRepository;
        this.districtService = districtService;
    }

    public List<Article> getJournalistArticles(String authorId) {
        return articleRepository.findByAuthorIdOrderByUpdatedAtDesc(authorId);
    }

    public List<Article> getPublishedArticles() {
        return articleRepository.findByStatusOrderByPublishedAtDesc(ArticleStatus.PUBLISHED);
    }

    public List<Article> getPublishedArticlesByDistrict(String districtId) {
        return articleRepository.findByStatusAndDistrictIdIgnoreCaseOrderByPublishedAtDesc(ArticleStatus.PUBLISHED, districtId);
    }

    public List<Article> getAllArticlesForAdmin() {
        return articleRepository.findAllByOrderByUpdatedAtDesc();
    }

    @Transactional
    public Article saveJournalistArticle(
            Account journalist,
            String articleId,
            String title,
            String shortDescription,
            String content,
            String districtId,
            String categorySlug,
            String coverImageUrl,
            boolean submitForReview
    ) {
        if (journalist.getRole() != Role.JOURNALIST) {
            throw new AccessDeniedException("Only Heritage Journalists can author articles.");
        }
        String cleanTitle = title == null ? "" : title.trim();
        String cleanShort = shortDescription == null ? "" : shortDescription.trim();
        String cleanContent = content == null ? "" : content.trim();

        if (cleanTitle.length() < 5 || cleanShort.length() < 10 || cleanContent.length() < 30) {
            throw new IllegalArgumentException("Article title, short description, and full content are required.");
        }

        District district = districtService.findById(districtId)
                .orElseThrow(() -> new IllegalArgumentException("Please select a valid Karnataka district."));

        String catSlug = categorySlug == null ? "" : categorySlug.trim();
        String catTitle = CATEGORY_TITLES.getOrDefault(catSlug, catSlug);
        String now = Instant.now().toString();

        Article article;
        if (articleId != null && !articleId.isBlank()) {
            article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new IllegalArgumentException("Article not found."));
            if (!article.getAuthorId().equals(journalist.getId())) {
                throw new AccessDeniedException("You can only edit your own articles.");
            }
            if (article.getStatus() == ArticleStatus.PUBLISHED) {
                throw new IllegalArgumentException("Published articles cannot be directly overwritten by the author.");
            }
        } else {
            article = new Article();
            article.setId(UUID.randomUUID().toString());
            article.setAuthorId(journalist.getId());
            article.setCreatedAt(now);
            String slugBase = cleanTitle.toLowerCase(Locale.ROOT)
                    .replaceAll("[^a-z0-9]+", "-")
                    .replaceAll("^-|-$", "");
            if (slugBase.length() > 60) slugBase = slugBase.substring(0, 60);
            article.setSlug(slugBase + "-" + article.getId().substring(0, 6));
        }

        article.setAuthorName(journalist.getFullName());
        article.setTitle(cleanTitle);
        article.setShortDescription(cleanShort);
        article.setContent(cleanContent);
        article.setDistrictId(district.getId());
        article.setDistrictName(district.getName());
        article.setCategorySlug(catSlug);
        article.setCategoryTitle(catTitle);
        if (coverImageUrl != null && !coverImageUrl.isBlank()) {
            article.setCoverImageUrl(coverImageUrl.trim());
        }
        // Journalists may ONLY set DRAFT or PENDING_REVIEW; never APPROVED or PUBLISHED
        article.setStatus(submitForReview ? ArticleStatus.PENDING_REVIEW : ArticleStatus.DRAFT);
        if (submitForReview) {
            article.setAdminFeedback("");
        }
        article.setUpdatedAt(now);

        return articleRepository.save(article);
    }

    @Transactional
    public Article reviewArticle(Account admin, String articleId, ArticleStatus targetStatus, String feedback) {
        if (admin.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only administrators can approve, reject, or publish articles.");
        }
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("Article not found."));

        if (targetStatus == ArticleStatus.REJECTED && (feedback == null || feedback.trim().isEmpty())) {
            throw new IllegalArgumentException("Please provide feedback when rejecting an article.");
        }

        String now = Instant.now().toString();
        article.setStatus(targetStatus);
        article.setReviewedBy(admin.getId());
        if (feedback != null && !feedback.trim().isEmpty()) {
            article.setAdminFeedback(feedback.trim());
        }
        if (targetStatus == ArticleStatus.PUBLISHED) {
            article.setPublishedAt(now);
        }
        article.setUpdatedAt(now);
        return articleRepository.save(article);
    }
}
