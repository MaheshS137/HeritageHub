package com.heritagehub.repository;

import com.heritagehub.model.Article;
import com.heritagehub.model.ArticleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, String> {
    List<Article> findByAuthorIdOrderByUpdatedAtDesc(String authorId);
    List<Article> findByStatusOrderByPublishedAtDesc(ArticleStatus status);
    List<Article> findByStatusAndDistrictIdIgnoreCaseOrderByPublishedAtDesc(ArticleStatus status, String districtId);
    List<Article> findAllByOrderByUpdatedAtDesc();
    Optional<Article> findBySlugAndStatus(String slug, ArticleStatus status);
    long countByStatus(ArticleStatus status);
}
