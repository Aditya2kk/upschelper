package com.upscnewshub.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(length = 10)
    private String icon;

    @Column(length = 20)
    private String color;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    public Category() {}

    public Category(UUID id, String name, String displayName, String icon, String color, Integer sortOrder) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.icon = icon;
        this.color = color;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String name;
        private String displayName;
        private String icon;
        private String color;
        private Integer sortOrder = 0;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder displayName(String displayName) { this.displayName = displayName; return this; }
        public Builder icon(String icon) { this.icon = icon; return this; }
        public Builder color(String color) { this.color = color; return this; }
        public Builder sortOrder(Integer sortOrder) { this.sortOrder = sortOrder; return this; }

        public Category build() {
            return new Category(id, name, displayName, icon, color, sortOrder);
        }
    }
}
