package kazikd.dev.server.Controller;

import kazikd.dev.server.Model.GoogleAuthToken;
import kazikd.dev.server.Model.MessageResponse;
import kazikd.dev.server.Model.RefreshEntity;
import kazikd.dev.server.Model.User;
import kazikd.dev.server.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(@RequestBody User user) {
        String result = userService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse(result));
    }

    @PostMapping("/login")
    public ResponseEntity<RefreshEntity> loginUser(@RequestBody User user) {
        RefreshEntity result = userService.loginUser(user);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<MessageResponse> deleteUser() {
        userService.deleteUser();
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }

    @PostMapping("/google")
    public ResponseEntity<RefreshEntity> googleLogin(@RequestBody GoogleAuthToken token) {
        RefreshEntity result = userService.googleLogin(token.token());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/refresh")
    public ResponseEntity<MessageResponse> refreshToken(@RequestBody RefreshEntity refreshEntity) {
//        System.out.println(refreshEntity);
        String result = userService.refreshToken(refreshEntity);
//        System.out.println(result);
        return ResponseEntity.ok(new MessageResponse(result));
    }

    @DeleteMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
        userService.logout();
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

}
