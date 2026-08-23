package com.upscnewshub.repository;

import com.upscnewshub.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, UUID> {
    List<DocumentChunk> findByDocumentIdOrderByChunkIndexAsc(UUID documentId);
    
    @Query("SELECT c FROM DocumentChunk c WHERE c.document.id = :documentId ORDER BY c.pageNumber ASC, c.chunkIndex ASC")
    List<DocumentChunk> findAllChunksByDocId(@Param("documentId") UUID documentId);

    void deleteByDocumentId(UUID documentId);
}
