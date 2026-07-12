package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.Skill;
import com.tranvuthien.portfolio.dto.SkillRequest;
import com.tranvuthien.portfolio.dto.SkillResponse;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.repository.SkillRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SkillServiceTest {

    @Mock
    private SkillRepository repository;

    @InjectMocks
    private SkillService service;

    private Skill skill(Long id, String name, int sortOrder) {
        Skill s = new Skill();
        s.setId(id);
        s.setName(name);
        s.setCategory("Backend");
        s.setProficiency(90);
        s.setSortOrder(sortOrder);
        return s;
    }

    @Test
    void listReturnsMappedResponsesInOrder() {
        when(repository.findAllByOrderBySortOrderAscIdAsc())
                .thenReturn(List.of(skill(1L, "Java", 0), skill(2L, "Spring Boot", 1)));

        List<SkillResponse> result = service.list();

        assertThat(result).extracting(SkillResponse::name)
                .containsExactly("Java", "Spring Boot");
    }

    @Test
    void createAppendsAtTheEndOfTheList() {
        when(repository.count()).thenReturn(5L);
        when(repository.save(any(Skill.class))).thenAnswer(inv -> inv.getArgument(0));

        SkillResponse created = service.create(new SkillRequest("Kafka", "Messaging", 70, null));

        assertThat(created.sortOrder()).isEqualTo(5);
        assertThat(created.name()).isEqualTo("Kafka");
    }

    @Test
    void updateUnknownIdThrowsNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(99L, new SkillRequest("Java", "Backend", 90, null)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void deleteUnknownIdThrowsNotFound() {
        when(repository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.delete(99L)).isInstanceOf(NotFoundException.class);
    }

    @Test
    void reorderAssignsSortOrderFollowingTheGivenIds() {
        Skill a = skill(1L, "Java", 0);
        Skill b = skill(2L, "Spring Boot", 1);
        when(repository.findAllById(List.of(2L, 1L))).thenReturn(List.of(a, b));

        service.reorder(List.of(2L, 1L));

        assertThat(b.getSortOrder()).isZero();
        assertThat(a.getSortOrder()).isEqualTo(1);
    }

    @Test
    void reorderWithUnknownIdThrowsNotFound() {
        when(repository.findAllById(List.of(1L, 99L))).thenReturn(List.of(skill(1L, "Java", 0)));

        assertThatThrownBy(() -> service.reorder(List.of(1L, 99L)))
                .isInstanceOf(NotFoundException.class);
    }
}
