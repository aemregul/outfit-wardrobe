package com.outfitcombine.backend.common.ratelimit;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Aspect
@Component
public class AiRateLimitAspect {

    private final ConcurrentHashMap<String, Deque<Instant>> requestLog = new ConcurrentHashMap<>();

    @Before("@annotation(aiRateLimited)")
    public void checkRateLimit(AiRateLimited aiRateLimited) {
        String userId = resolveUserId();
        int limit = aiRateLimited.requestsPerMinute();
        Instant now = Instant.now();
        Instant windowStart = now.minusSeconds(60);

        Deque<Instant> timestamps = requestLog.computeIfAbsent(userId, k -> new ArrayDeque<>());

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(windowStart)) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= limit) {
                throw new RateLimitExceededException(limit);
            }
            timestamps.addLast(now);
        }
    }

    private String resolveUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        return "anonymous";
    }
}
