package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.CacheConfig;
import com.tranvuthien.portfolio.dto.SkillRequest;
import com.tranvuthien.portfolio.dto.SkillResponse;
import com.tranvuthien.portfolio.repository.SkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.util.Objects;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
@ActiveProfiles("test")
class PublicContentCacheTest {

    @Autowired
    private SkillService skillService;

    @MockitoSpyBean
    private SkillRepository skillRepository;

    @Autowired
    private CacheManager cacheManager;

    @BeforeEach
    void resetCacheAndSpy() {
        Objects.requireNonNull(cacheManager.getCache(CacheConfig.SKILLS)).clear();
        Mockito.clearInvocations(skillRepository);
    }

    @Test
    void repeatedListCallsHitTheDatabaseOnlyOnce() {
        skillService.list();
        skillService.list();
        skillService.list();

        verify(skillRepository, times(1)).findAllByOrderBySortOrderAscIdAsc();
    }

    @Test
    void mutationsEvictTheCacheSoTheNextReadIsFresh() {
        skillService.list();
        SkillResponse created = skillService.create(new SkillRequest("Cache Test", "Testing", 50, null));
        skillService.list();

        verify(skillRepository, times(2)).findAllByOrderBySortOrderAscIdAsc();

        skillService.delete(created.id());
    }
}
