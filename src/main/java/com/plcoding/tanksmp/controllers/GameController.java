package com.plcoding.tanksmp.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.plcoding.tanksmp.controllers.dto.JoinGameDto;
import com.plcoding.tanksmp.controllers.dto.JoinMatchResponse;
import com.plcoding.tanksmp.controllers.dto.MatchEvent;
import com.plcoding.tanksmp.controllers.dto.TurnCommand;
import com.plcoding.tanksmp.model.Game;
import com.plcoding.tanksmp.service.GameService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/api/matches")
public class GameController {

    static final String PLAYER_TOKEN_HEADER = "X-Player-Token";

    private final GameService gameService;

    @PostMapping
    public ResponseEntity<Game> createMatch() {
        Game game = gameService.initializeGame();
        log.info("match created: {}", game.getGameId());
        return ResponseEntity.ok(game);
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<Game> getMatch(@PathVariable("gameId") String gameId) {
        return ResponseEntity.ok(gameService.getGame(gameId));
    }

    @PostMapping("/{gameId}/players")
    public ResponseEntity<JoinMatchResponse> joinMatch(@PathVariable("gameId") String gameId,
            @RequestBody JoinGameDto request) {
        log.info("join request for match {}: {}", gameId, request);
        JoinMatchResponse response = gameService.joinGame(request.getPlayerName(), request.getRequestedColor(),
                gameId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{gameId}/start")
    public ResponseEntity<Game> startMatch(@PathVariable("gameId") String gameId,
            @RequestHeader(value = PLAYER_TOKEN_HEADER, required = false) String playerToken) {
        log.info("start request for match {}", gameId);
        Game game = gameService.startGame(gameId, playerToken);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/{gameId}/rematch")
    public ResponseEntity<Game> rematch(@PathVariable("gameId") String gameId,
            @RequestHeader(value = PLAYER_TOKEN_HEADER, required = false) String playerToken) {
        log.info("rematch request for match {}", gameId);
        return ResponseEntity.ok(gameService.rematch(gameId, playerToken));
    }

    @PostMapping("/{gameId}/turns")
    public ResponseEntity<Game> takeTurn(@PathVariable("gameId") String gameId,
            @RequestBody TurnCommand command,
            @RequestHeader(value = PLAYER_TOKEN_HEADER, required = false) String playerToken) {
        log.info("turn request for match {}", gameId);
        MatchEvent turnEvent = gameService.takeTurn(gameId, command, playerToken);
        return ResponseEntity.ok(turnEvent.game());
    }
}
