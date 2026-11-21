package com.plcoding.tanksmp.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.plcoding.tanksmp.controllers.dto.JoinGameDto;
import com.plcoding.tanksmp.model.Game;
import com.plcoding.tanksmp.service.GameService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/api/matches")
public class GameController {

    private static final String GAME_PROGRESS_TOPIC = "/topic/game-progress/";

    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

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
    public ResponseEntity<Game> joinMatch(@PathVariable("gameId") String gameId,
            @RequestBody JoinGameDto request) {
        log.info("join request for match {}: {}", gameId, request);
        Game game = gameService.joinGame(request.getPlayerName(), request.getRequestedColor(), gameId);
        broadcast(game);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/{gameId}/start")
    public ResponseEntity<Game> startMatch(@PathVariable("gameId") String gameId) {
        log.info("start request for match {}", gameId);
        Game game = gameService.startGame(gameId);
        broadcast(game);
        return ResponseEntity.ok(game);
    }

    private void broadcast(Game game) {
        simpMessagingTemplate.convertAndSend(GAME_PROGRESS_TOPIC + game.getGameId(), game);
    }
}
