package com.plcoding.tanksmp.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Forwards client-side routes (for example /match) to the single-page app's index.html so that
 * refreshing or deep-linking works. API, WebSocket and asset paths (anything containing a file
 * extension) are not forwarded. Client routes are at most two segments deep.
 */
@Controller
public class SpaForwardingController {

    @GetMapping({
            "/{firstSegment:^(?!api$|ws$)[^.]*}",
            "/{firstSegment:^(?!api$|ws$)[^.]*}/{secondSegment:[^.]*}"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
