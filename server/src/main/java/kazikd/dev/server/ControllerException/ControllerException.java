package kazikd.dev.server.ControllerException;

import io.jsonwebtoken.JwtException;
import kazikd.dev.server.Model.MessageResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class ControllerException{

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<MessageResponse> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("User already exists"));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<MessageResponse> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Invalid credentials"));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<MessageResponse> handleUserNotFound(UserNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<MessageResponse> handleInvalidRefreshToken(InvalidRefreshTokenException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse(e.getMessage()));
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<MessageResponse> handleJwtException(JwtException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Invalid or expired JWT token"));
    }

    @ExceptionHandler(InvalidGoogleTokenException.class)
    public ResponseEntity<MessageResponse> handleInvalidGoogleTokenException(InvalidGoogleTokenException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse(e.getMessage()));
    }

    @ExceptionHandler(InvalidUserDataException.class)
    public ResponseEntity<MessageResponse> handleInvalidUserData(InvalidUserDataException e) {
        return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponse> handleGeneralException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("An unexpected error occurred"));
    }
}

