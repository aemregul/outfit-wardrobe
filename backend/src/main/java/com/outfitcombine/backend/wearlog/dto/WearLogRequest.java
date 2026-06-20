package com.outfitcombine.backend.wearlog.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record WearLogRequest(
        LocalDateTime wornAt,

        @Size(max = 255)
        String location,

        @Size(max = 255)
        String occasion,

        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        Integer rating,

        String photoUrl,

        @Size(max = 1000)
        String note,

        Boolean wouldWearAgain
) {}
