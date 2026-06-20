package com.outfitcombine.backend.common.ratelimit;

public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException(int limit) {
        super("AI rate limit exceeded: maximum " + limit + " requests per minute allowed.");
    }
}
