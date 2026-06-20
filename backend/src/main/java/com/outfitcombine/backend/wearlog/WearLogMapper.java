package com.outfitcombine.backend.wearlog;

import com.outfitcombine.backend.wearlog.dto.WearLogResponse;
import org.springframework.stereotype.Component;

@Component
public class WearLogMapper {

    public WearLogResponse toResponse(WearLog log) {
        return new WearLogResponse(
                log.getId(),
                log.getUserId(),
                log.getOutfitId(),
                log.getWornAt(),
                log.getLocation(),
                log.getOccasion(),
                log.getRating(),
                log.getPhotoUrl(),
                log.getNote(),
                log.getWouldWearAgain(),
                log.getCreatedAt()
        );
    }
}
