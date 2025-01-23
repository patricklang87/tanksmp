package com.plcoding.tanksmp.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.plcoding.tanksmp.controllers.dto.InitializeGameDto;
import com.plcoding.tanksmp.controllers.dto.JoinGameDto;
import com.plcoding.tanksmp.controllers.dto.StartGameDto;
import com.plcoding.tanksmp.exceptions.InvaildGameException;
import com.plcoding.tanksmp.exceptions.InvaildParamException;
import com.plcoding.tanksmp.exceptions.NotFoundException;
import com.plcoding.tanksmp.model.Game;
import com.plcoding.tanksmp.model.TakeTurn;
import com.plcoding.tanksmp.service.GameService;
import com.plcoding.tanksmp.storage.GameStorage;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/match")
public class GameController {

    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @GetMapping("/initialize")
    public ResponseEntity<Game> initialize() {
        log.info("game code requested");
        Game game = gameService.initializeGame();
        System.out.println("in initialize:" + game.getGameId());
        return ResponseEntity.ok(game);
    }

    @GetMapping("/initialize/{gameId}")
    public ResponseEntity<Game> subscribe(@PathVariable("gameId") String gameId) {
        log.info("game subscription requested", gameId);
        Game game = GameStorage.getInstance().getGames().get(gameId);
        System.out.println("in subscribe:" + game.getGameId());
        simpMessagingTemplate.convertAndSend("/topic/game-progress/" +
        game.getGameId(), game);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/join")
    public ResponseEntity<Game> join(@RequestBody JoinGameDto request)
            throws InvaildGameException, InvaildParamException {
        log.info("join request: {}", request);
        Game game = gameService.joinGame(request.getPlayerName(), request.getRequestedColor(), request.getGameId());
        
        System.out.println("in join:" + game.getGameId());
        
        simpMessagingTemplate.convertAndSend("/topic/game-progress/" +
        game.getGameId(), game);
            return ResponseEntity
                    .ok(game);
    }

    @PostMapping("/start")
    public ResponseEntity<Game> start(@RequestBody StartGameDto request)
            throws InvaildGameException, InvaildParamException {
        log.info("start request: {}", request);
        Game game = gameService.startGame(request.getGameId());
        simpMessagingTemplate.convertAndSend("/topic/game-progress/" +
        game.getGameId(), game);
        return ResponseEntity
                .ok(game);
    }

    @PostMapping("/gameplay")
    public ResponseEntity<Game> gamePlay(@RequestBody TakeTurn request) throws
    InvaildGameException, NotFoundException {
        log.info("game play request: {}", request);
        Game game = gameService.takeTurn(request);
        simpMessagingTemplate.convertAndSend("/topic/game-progress/" +
                game.getGameId(), game);

        return ResponseEntity.ok(game);
    }

    // @MessageMapping("/gameplay")
    // @SendTo("/topic/game-progress")
    // public ResponseEntity<Game> gamePlay(@Payload TakeTurn request) {
    //     log.info("game play request: {}", request);
    //     Game game = gameService.takeTurn(request);
    //     simpMessagingTemplate.convertAndSend("/topic/game-progress/" +
    //             game.getGameId(), game);

    //     return ResponseEntity.ok(game);
    // }

}
