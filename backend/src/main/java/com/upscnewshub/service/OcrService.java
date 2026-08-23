package com.upscnewshub.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OcrService {

    private static final Logger log = LoggerFactory.getLogger(OcrService.class);

    @Value("${app.storage.local-path:./uploads}")
    private String storageBasePath;

    private File resolveScript(String scriptName) {
        File scriptFile = new File("scripts/" + scriptName);
        if (!scriptFile.exists()) {
            scriptFile = new File("../scripts/" + scriptName);
        }
        if (!scriptFile.exists()) {
            scriptFile = new File("backend/scripts/" + scriptName);
        }
        return scriptFile;
    }

    /**
     * High-speed Batch OCR: Renders all target pages in parallel and processes them
     * in a single batch PowerShell process with hardware-accelerated WinRT OcrEngine.
     * Completes a 20-page newspaper in ~4 seconds instead of 60+ seconds.
     */
    public Map<Integer, String> ocrPagesBatch(PDDocument pdDoc, List<Integer> pageIndices) {
        Map<Integer, String> results = new ConcurrentHashMap<>();
        if (pageIndices == null || pageIndices.isEmpty()) {
            return results;
        }

        String basePath = (storageBasePath != null && !storageBasePath.isEmpty()) ? storageBasePath : "./uploads";
        String batchId = "batch_" + UUID.randomUUID().toString().substring(0, 8);
        Path batchDir = Paths.get(basePath, "temp", batchId).toAbsolutePath().normalize();
        Path inDir = batchDir.resolve("images");
        Path outDir = batchDir.resolve("output");

        try {
            Files.createDirectories(inDir);
            Files.createDirectories(outDir);

            PDFRenderer renderer = new PDFRenderer(pdDoc);
            log.info("Starting parallel image rendering for {} pages...", pageIndices.size());
            long startRender = System.currentTimeMillis();

            // Render all requested pages in parallel (120 DPI is crisp for OCR & fast)
            pageIndices.parallelStream().forEach(pageIndex -> {
                try {
                    BufferedImage image = renderer.renderImageWithDPI(pageIndex, 120, ImageType.RGB);
                    String filename = String.format("page_%04d.png", pageIndex);
                    File imgFile = inDir.resolve(filename).toFile();
                    ImageIO.write(image, "png", imgFile);
                } catch (Exception e) {
                    log.warn("Failed to render page {} for batch OCR: {}", pageIndex + 1, e.getMessage());
                }
            });

            long renderTime = System.currentTimeMillis() - startRender;
            log.info("Parallel rendering of {} pages completed in {}ms. Running single-process batch OCR...", pageIndices.size(), renderTime);

            long startOcr = System.currentTimeMillis();
            File batchScript = resolveScript("batch-ocr.ps1");
            if (!batchScript.exists()) {
                log.warn("batch-ocr.ps1 not found at {}, falling back to single page script", batchScript.getAbsolutePath());
                for (int p : pageIndices) {
                    results.put(p, ocrSinglePage(pdDoc, p));
                }
                return results;
            }

            ProcessBuilder pb = new ProcessBuilder(
                    "powershell.exe",
                    "-NoProfile",
                    "-ExecutionPolicy", "Bypass",
                    "-Command",
                    "& '" + batchScript.getAbsolutePath() + "' -inputDir '" + inDir.toString() + "' -outputDir '" + outDir.toString() + "'"
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.debug("Batch OCR script output: {}", line);
                }
            }

            int exitCode = process.waitFor();
            long ocrTime = System.currentTimeMillis() - startOcr;
            log.info("Single-process batch OCR completed in {}ms (exit code: {})", ocrTime, exitCode);

            // Read output text files
            for (int pageIndex : pageIndices) {
                String filename = String.format("page_%04d.txt", pageIndex);
                Path txtPath = outDir.resolve(filename);
                if (Files.exists(txtPath)) {
                    String content = Files.readString(txtPath, StandardCharsets.UTF_8).trim();
                    results.put(pageIndex, content);
                } else {
                    results.put(pageIndex, "");
                }
            }
        } catch (Exception e) {
            log.error("Batch OCR execution error: {}", e.getMessage(), e);
        } finally {
            // Cleanup batch temporary files
            try {
                if (Files.exists(batchDir)) {
                    try (var walk = Files.walk(batchDir)) {
                        walk.sorted(Comparator.reverseOrder()).map(Path::toFile).forEach(File::delete);
                    }
                }
            } catch (Exception ignored) {}
        }

        return results;
    }

    public String ocrPage(PDDocument pdDoc, int pageIndex) {
        var map = ocrPagesBatch(pdDoc, List.of(pageIndex));
        return map.getOrDefault(pageIndex, "");
    }

    private String ocrSinglePage(PDDocument pdDoc, int pageIndex) {
        String basePath = (storageBasePath != null && !storageBasePath.isEmpty()) ? storageBasePath : "./uploads";
        Path tempDir = Paths.get(basePath, "temp").toAbsolutePath().normalize();
        File tempImage = null;
        try {
            Files.createDirectories(tempDir);
            PDFRenderer renderer = new PDFRenderer(pdDoc);
            BufferedImage image = renderer.renderImageWithDPI(pageIndex, 120, ImageType.RGB);
            String tempFilename = "ocr_" + UUID.randomUUID().toString() + ".png";
            tempImage = tempDir.resolve(tempFilename).toFile();
            ImageIO.write(image, "png", tempImage);

            File scriptFile = resolveScript("run-ocr.ps1");
            ProcessBuilder pb = new ProcessBuilder(
                    "powershell.exe",
                    "-NoProfile",
                    "-ExecutionPolicy", "Bypass",
                    "-Command",
                    "& '" + scriptFile.getAbsolutePath() + "' -imagePath '" + tempImage.getAbsolutePath() + "'"
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();
            StringBuilder ocrOutput = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    ocrOutput.append(line).append("\n");
                }
            }
            process.waitFor();
            return ocrOutput.toString().trim();
        } catch (Exception e) {
            log.error("Single page OCR failed for page {}: {}", pageIndex + 1, e.getMessage());
            return "";
        } finally {
            if (tempImage != null && tempImage.exists()) {
                tempImage.delete();
            }
        }
    }
}
