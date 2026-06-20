package com.outfitcombine.backend.ai;

import com.outfitcombine.backend.ai.dto.ClothingAnalysisResult;
import com.outfitcombine.backend.ai.dto.OutfitSuggestion;
import com.outfitcombine.backend.ai.dto.OutfitSuggestionContext;

public interface AiService {

    ClothingAnalysisResult analyzeClothing(String imageUrl);

    OutfitSuggestion suggestOutfit(OutfitSuggestionContext context);
}
