package com.plcoding.tanksmp.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ClientForwardController {

    @GetMapping(value = "/**/{path:[^\\.]*}") //will require fine tuning depending on how you want to handle incoming data from the app¸
    public String forward() {
        return "forward:/";
    }
}

