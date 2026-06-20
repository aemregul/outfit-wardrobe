package com.outfitcombine.backend.wearlog.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record WearLogResponse(
        UUID id,
        UUID userId,
        UUID outfitId,
        LocalDateTime wornAt,
        String location,
        String occasion,
        Integer rating,
        String photoUrl,
        String note,
        Boolean wouldWearAgain,
        LocalDateTime createdAt
) {}
