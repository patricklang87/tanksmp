package com.plcoding.tanksmp.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.plcoding.tanksmp.controllers.dto.InitializeGameDto;
import com.plcoding.tanksmp.controllers.dto.JoinGameDto;
import com.plcoding.tanksmp.controllers.dto.StartGameDto;
import com.plcoding.tanksmp.exceptions.InvaildGameException;
import com.plcoding.tanksmp.exceptions.InvaildParamException;
import com.plcoding.tanksmp.model.Game;
import com.plcoding.tanksmp.service.GameService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/match")
public class GameController {

    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/initialize")
    public ResponseEntity<Game> initialize(@RequestBody InitializeGameDto request) {
        log.info("start game request: {}", request);
        return ResponseEntity.ok(gameService.initializeGame(request.getPlayerName(), request.getRequestedColor()));
    }

    @PostMapping("/join")
    public ResponseEntity<Game> join(@RequestBody JoinGameDto request)
            throws InvaildGameException, InvaildParamException {
        log.info("join request: {}", request);
            return ResponseEntity
                    .ok(gameService.joinGame(request.getPlayerName(), request.getRequestedColor(),
                            request.getGameId()));

    }

    @PostMapping("/start")
    public ResponseEntity<Game> start(@RequestBody StartGameDto request)
            throws InvaildGameException, InvaildParamException {
        log.info("start request: {}", request);
        return ResponseEntity
                .ok(gameService.startGame(request.getPlayerGameId(), request.getGameId()));
    }

    // @PostMapping("/takeTurn")
    // public ResponseEntity<Game> gamePlay(@RequestBody GamePlay request) throws
    // NotFoundException, InvalidGameException {
    // log.info("game play request: {}", request);
    // Game game = gameService.takeTurn(request);
    // simpMessagingTemplate.convertAndSend("/topic/game-progress/" +
    // game.getGameId(), game);

    // return ResponseEntity.ok(game);
    // }

}
