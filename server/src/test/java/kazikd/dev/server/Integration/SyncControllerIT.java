package kazikd.dev.server.Integration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import kazikd.dev.server.Model.User;
import kazikd.dev.server.Model.WeightEntry;
import kazikd.dev.server.Model.WeightEntryDTO;
import kazikd.dev.server.Repository.SyncRepo;
import kazikd.dev.server.Repository.UserRepo;
import kazikd.dev.server.Service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;

import static kazikd.dev.server.Helpers.PerformHelpers.performDeleteCheckMessage;
import static kazikd.dev.server.Helpers.PerformHelpers.performPostWithAuthHeaderCheckMessage;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SyncControllerIT {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    @MockitoSpyBean
    private SyncRepo syncRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JwtService jwtService;

    private final String dummyEmail = "email@email.com";
    private final String dummyPassword = "password";
    private final User dummyUser = new User(dummyEmail, dummyPassword);

    private final List<WeightEntryDTO> testDTOs = List.of(
            new WeightEntryDTO(LocalDate.of(2025, 1, 1), 80.0),
            new WeightEntryDTO(LocalDate.of(2025, 1, 2), 81.0),
            new WeightEntryDTO(LocalDate.of(2025, 1, 3), 82.0)
    );

    @BeforeEach
    void setUp() {
        userRepo.deleteAll();
    }

    // no endpoint login - generates jwt token, does not save refresh token in db
    private String registerGetJwt() {
        userRepo.save(dummyUser);
        return jwtService.generateToken(dummyEmail);
    }

    private void compareWeightEntries(List<WeightEntry> entries, List<WeightEntryDTO> dtos) {
        assertEquals(entries.size(), dtos.size());
        for (int i = 0; i < entries.size(); i++) {
            assertEquals(entries.get(i).getDate(), dtos.get(i).getDate());
            assertEquals(entries.get(i).getWeight(), dtos.get(i).getWeight());
        }
    }

    @Test
    void syncToCloud_withNewEntries_shouldSaveNew() throws Exception {
        String jwt = registerGetJwt();

        performPostWithAuthHeaderCheckMessage(mockMvc, objectMapper,
                "/sync", jwt, testDTOs, 200, "Data synced to cloud");

        List<WeightEntry> savedEntries = syncRepo.findByUser(dummyUser);

        compareWeightEntries(savedEntries, testDTOs);
    }

    @Test
    void syncToCloud_withNotMatchingWeight_shouldUpdate() throws Exception {
        String jwt = registerGetJwt();

        WeightEntry entry = new WeightEntry(LocalDate.of(2025, 1, 1), 90.0, dummyUser);
        syncRepo.save(entry);

        performPostWithAuthHeaderCheckMessage(mockMvc, objectMapper,
                "/sync", jwt, testDTOs, 200, "Data synced to cloud");

        List<WeightEntry> savedEntries = syncRepo.findByUser(dummyUser);

        compareWeightEntries(savedEntries, testDTOs);
    }

    @Test
    void syncToCloud_withNotMatchingDate_shouldDelete() throws Exception {
        String jwt = registerGetJwt();

        WeightEntry entry = new WeightEntry(LocalDate.of(2025, 1, 4), 80.0, dummyUser);
        syncRepo.save(entry);

        performPostWithAuthHeaderCheckMessage(mockMvc, objectMapper,
                "/sync", jwt, testDTOs, 200, "Data synced to cloud");

        List<WeightEntry> savedEntries = syncRepo.findByUser(dummyUser);

        compareWeightEntries(savedEntries, testDTOs);
    }

    @Test
    void syncToCloud_emptyDTOs_shouldDeleteAll() throws Exception {
        String jwt = registerGetJwt();

        WeightEntry entry = new WeightEntry(LocalDate.of(2025, 1, 4), 80.0, dummyUser);
        syncRepo.save(entry);

        performPostWithAuthHeaderCheckMessage(mockMvc, objectMapper,
                "/sync", jwt, List.of(), 200, "Data synced to cloud");

        List<WeightEntry> savedEntries = syncRepo.findByUser(dummyUser);

        assertTrue(savedEntries.isEmpty());
    }

    @Test
    void syncToCloud_nothingChanged_shouldNotUseDB() throws Exception {
        String jwt = registerGetJwt();

        List<WeightEntry> entries = testDTOs.stream()
                .map(dto -> new WeightEntry(dto.getDate(), dto.getWeight(), dummyUser))
                .toList();
        syncRepo.saveAll(entries);

        Mockito.clearInvocations(syncRepo);

        performPostWithAuthHeaderCheckMessage(mockMvc, objectMapper,
                "/sync", jwt, testDTOs, 200, "Data synced to cloud");

        verify(syncRepo, never()).save(any());
        verify(syncRepo, never()).delete(any());
    }

    @Test
    void syncToCloud_withDuplicateDates_shouldNotThrowException() throws Exception {
        String jwt = registerGetJwt();

        List<WeightEntryDTO> duplicated = List.of(testDTOs.getFirst(), testDTOs.getFirst());

        performPostWithAuthHeaderCheckMessage(mockMvc, objectMapper,
                "/sync", jwt, duplicated, 200, "Data synced to cloud");
    }

    @Test
    void syncFromCloud_whenEntriesExist_shouldReturnDTOs() throws Exception {
        String jwt = registerGetJwt();

        List<WeightEntry> entries = List.of(
                new WeightEntry(LocalDate.of(2025, 1, 1), 80.0, dummyUser),
                new WeightEntry(LocalDate.of(2025, 1, 2), 81.0, dummyUser)
        );
        syncRepo.saveAll(entries);

        MvcResult result = mockMvc.perform(get("/sync")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        List<WeightEntryDTO> DTOs = objectMapper.readValue(content, new TypeReference<>() {
        });
        compareWeightEntries(entries, DTOs);
    }

    @Test
    void syncFromCloud_whenNoEntries_shouldReturnEmptyList() throws Exception {
        String jwt = registerGetJwt();

        mockMvc.perform(get("/sync")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void deleteAllUserEntries_shouldRemoveAllEntriesForUser() throws Exception {
        String jwt = registerGetJwt();

        List<WeightEntry> entries = List.of(
                new WeightEntry(LocalDate.of(2025, 1, 1), 80.0, dummyUser),
                new WeightEntry(LocalDate.of(2025, 1, 2), 81.0, dummyUser)
        );
        syncRepo.saveAll(entries);
        assertEquals(2, syncRepo.findByUser(dummyUser).size());

        performDeleteCheckMessage(mockMvc, "/sync", jwt, "All user entries deleted");

        List<WeightEntry> savedEntries = syncRepo.findByUser(dummyUser);
        assertTrue(savedEntries.isEmpty());
    }

    //more users in the db tests

    private User registerOtherUserAndAddEntries() {
        String emailB = "other@email.com";
        User userB = userRepo.save(new User(emailB, dummyPassword));

        List<WeightEntry> userBEntries = List.of(
                new WeightEntry(LocalDate.of(2025, 1, 1), 70.0, userB),
                new WeightEntry(LocalDate.of(2025, 1, 2), 71.0, userB)
        );
        syncRepo.saveAll(userBEntries);
        return userB;
    }

    @Test
    void deleteAllUserEntries_whenMoreUsers_shouldNotDeleteOtherUsersEntries() throws Exception {
        String jwtA = registerGetJwt();

        User userB = registerOtherUserAndAddEntries();

        performDeleteCheckMessage(mockMvc, "/sync", jwtA, "All user entries deleted");

        List<WeightEntry> savedEntries = syncRepo.findByUser(userB);
        assertEquals(2, savedEntries.size());
    }

    @Test
    void syncToCloud_whenMoreUsers_shouldNotModifyOtherUsersData() throws Exception {
        String jwtA = registerGetJwt();

        User userB = registerOtherUserAndAddEntries();

        performPostWithAuthHeaderCheckMessage(mockMvc, objectMapper,
                "/sync", jwtA, testDTOs, 200, "Data synced to cloud");

        List<WeightEntry> savedEntries = syncRepo.findByUser(userB);
        assertEquals(2, savedEntries.size());
        assertEquals(70.0, savedEntries.get(0).getWeight());
        assertEquals(71.0, savedEntries.get(1).getWeight());
    }

    @Test
    void syncFromCloud_whenMoreUsers_shouldNotReturnOtherUsersData() throws Exception {
        String jwtA = registerGetJwt();

        registerOtherUserAndAddEntries();

        mockMvc.perform(get("/sync")
                        .header("Authorization", "Bearer " + jwtA))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

}
