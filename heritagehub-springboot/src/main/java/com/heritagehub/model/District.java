package com.heritagehub.model;

import java.util.Collections;
import java.util.List;

public class District {
    private String id;
    private String name;
    private String region;
    private String division;
    private boolean documented;
    private String geoBoundaryNote;
    private String monumentName;
    private String monumentLocation;
    private double monumentLat;
    private double monumentLng;
    private String monumentImageKey;
    private String monumentDescription;
    private String culturalSignificance;
    private String monumentAttribution;
    private List<String> galleryImages = Collections.emptyList();
    private String description;
    private String history;
    private List<String> festivals = Collections.emptyList();
    private List<String> arts = Collections.emptyList();
    private List<String> cuisine = Collections.emptyList();
    private List<String> traditions = Collections.emptyList();
    private List<String> heritageSites = Collections.emptyList();
    private List<String> images = Collections.emptyList();
    private List<DistrictSource> sources = Collections.emptyList();

    public static class DistrictSource {
        private String title;
        private String organization;
        private String url;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getOrganization() { return organization; }
        public void setOrganization(String organization) { this.organization = organization; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }

    public boolean isDocumented() { return documented; }
    public void setDocumented(boolean documented) { this.documented = documented; }

    public String getGeoBoundaryNote() { return geoBoundaryNote; }
    public void setGeoBoundaryNote(String geoBoundaryNote) { this.geoBoundaryNote = geoBoundaryNote; }

    public String getMonumentName() { return monumentName; }
    public void setMonumentName(String monumentName) { this.monumentName = monumentName; }

    public String getMonumentLocation() { return monumentLocation; }
    public void setMonumentLocation(String monumentLocation) { this.monumentLocation = monumentLocation; }

    public double getMonumentLat() { return monumentLat; }
    public void setMonumentLat(double monumentLat) { this.monumentLat = monumentLat; }

    public double getMonumentLng() { return monumentLng; }
    public void setMonumentLng(double monumentLng) { this.monumentLng = monumentLng; }

    public String getMonumentImageKey() { return monumentImageKey; }
    public void setMonumentImageKey(String monumentImageKey) { this.monumentImageKey = monumentImageKey; }

    public String getMonumentDescription() { return monumentDescription; }
    public void setMonumentDescription(String monumentDescription) { this.monumentDescription = monumentDescription; }

    public String getCulturalSignificance() { return culturalSignificance; }
    public void setCulturalSignificance(String culturalSignificance) { this.culturalSignificance = culturalSignificance; }

    public String getMonumentAttribution() { return monumentAttribution; }
    public void setMonumentAttribution(String monumentAttribution) { this.monumentAttribution = monumentAttribution; }

    public List<String> getGalleryImages() { return galleryImages; }
    public void setGalleryImages(List<String> galleryImages) { this.galleryImages = galleryImages != null ? galleryImages : Collections.emptyList(); }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHistory() { return history; }
    public void setHistory(String history) { this.history = history; }

    public List<String> getFestivals() { return festivals; }
    public void setFestivals(List<String> festivals) { this.festivals = festivals != null ? festivals : Collections.emptyList(); }

    public List<String> getArts() { return arts; }
    public void setArts(List<String> arts) { this.arts = arts != null ? arts : Collections.emptyList(); }

    public List<String> getCuisine() { return cuisine; }
    public void setCuisine(List<String> cuisine) { this.cuisine = cuisine != null ? cuisine : Collections.emptyList(); }

    public List<String> getTraditions() { return traditions; }
    public void setTraditions(List<String> traditions) { this.traditions = traditions != null ? traditions : Collections.emptyList(); }

    public List<String> getHeritageSites() { return heritageSites; }
    public void setHeritageSites(List<String> heritageSites) { this.heritageSites = heritageSites != null ? heritageSites : Collections.emptyList(); }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images != null ? images : Collections.emptyList(); }

    public List<DistrictSource> getSources() { return sources; }
    public void setSources(List<DistrictSource> sources) { this.sources = sources != null ? sources : Collections.emptyList(); }
}
