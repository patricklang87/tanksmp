package com.plcoding.tanksmp.controllers;

import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ClientForwardController {

    @GetMapping(value = "/**/{path:[^\\.]*}") //will require fine tuning depending on how you want to handle incoming data from the app¸
    public String forward() {
        System.out.println("in client forward controller");
        return "forward:/";
    }



}

