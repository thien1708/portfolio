package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.AnalyticsEvent;
import com.tranvuthien.portfolio.dto.AnalyticsSummaryResponse;
import com.tranvuthien.portfolio.dto.AnalyticsTrackRequest;
import com.tranvuthien.portfolio.repository.AnalyticsEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private AnalyticsEventRepository repository;

    private AnalyticsService service;

    @BeforeEach
    void setUp() {
        service = new AnalyticsService(repository);
    }

    @Test
    void trackIgnoresAdminPaths() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.168.1.50");

        AnalyticsTrackRequest req = new AnalyticsTrackRequest("PAGE_VIEW", "/admin/dashboard", null, null);
        service.track(req, request);

        verify(repository, never()).save(any());
    }

    @Test
    void trackHashesIpAndDetectsMobile() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("123.45.67.89");
        request.addHeader("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15");

        AnalyticsTrackRequest req = new AnalyticsTrackRequest("CV_VIEW", "/cv.pdf", "https://linkedin.com", "Resume Modal");
        service.track(req, request);

        ArgumentCaptor<AnalyticsEvent> captor = ArgumentCaptor.forClass(AnalyticsEvent.class);
        verify(repository).save(captor.capture());

        AnalyticsEvent saved = captor.getValue();
        assertThat(saved.getEventType()).isEqualTo("CV_VIEW");
        assertThat(saved.getDeviceType()).isEqualTo("MOBILE");
        assertThat(saved.getIpHash()).isNotEqualTo("123.45.67.89");
        assertThat(saved.getIpHash()).hasSize(64); // SHA-256 length
        assertThat(saved.getReferrer()).isEqualTo("https://linkedin.com");
    }

    @Test
    void getSummaryReturnsCalculatedStats() {
        when(repository.count()).thenReturn(150L);
        when(repository.countDistinctVisitorsTotal()).thenReturn(45L);
        when(repository.countByEventTypeAndCreatedAtAfter(any(), any())).thenReturn(10L);
        when(repository.countByDeviceTypeSince(any())).thenReturn(List.<Object[]>of(new Object[]{"DESKTOP", 80L}, new Object[]{"MOBILE", 20L}));

        AnalyticsSummaryResponse summary = service.getSummary(14);

        assertThat(summary.totalViews()).isEqualTo(150L);
        assertThat(summary.uniqueVisitors()).isEqualTo(45L);
        assertThat(summary.deviceBreakdown()).containsEntry("DESKTOP", 80L);
    }
}
