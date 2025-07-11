THIS UNFINISHED I WILL GET BACK TO IT SOMEDAY, FEEL FREE TO PLAY 

# Pixel-Meet
A cute game I made for my beautiful, intelligent, and wonderful girl chronicling the meeting of Daniela and Luke as a pixelated character,
watch as love envelops you, believe it as your friendly cat NPCs, and make it come true with Pixel Meet! 

INSTRUCTIONS: Click code, download ZIP, extract zip in a singular folder (all files must remain together for the game to
run properly), then start a simple local web server (e.g. `python -m http.server`) and open `index.html` from that server.
Opening the file directly on some mobile browsers can prevent scripts from loading due to strict security settings.

P.S - I love ya Daniela!

## Browser Interaction and Security

Pixel-Meet runs entirely in the browser with local scripts and assets only. The game does not make any
network requests or process user data beyond simple keyboard controls for movement. This approach
reduces attack surface and helps maintain a secure runtime environment. It also aligns with the
[Oracle Secure Coding Guidelines](https://docs.oracle.com/en/java/javase/17/seccode/seccode1.html)
recommendations for fundamentals and input validation by minimizing potential external input and not
trusting data from outside sources.

## Additional Security Practices

Pixel-Meet adheres to the [Microsoft Best Security Practices for Game Development](https://learn.microsoft.com/en-us/windows/win32/dxtecharts/best-security-practices-in-game-development).
The code avoids dangerous functions such as `eval` and isolates its logic to reduce the attack surface.

It also follows Google's [Web Application Requirements](https://partner-security.withgoogle.com/docs/webapp_requirements.html#encryption).
While this game does not perform any network communication, any future online features must enforce HTTPS/TLS encryption for all data in transit.
