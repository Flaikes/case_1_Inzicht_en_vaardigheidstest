# case_1_inzicht_en_vaardigheidstest

## Een chat applicatie geschreven in JavaScript met Socket.io in Node.js.

Deze simpele chat-app geeft gebruikers de mogelijkheid om in verschillende rooms met elkaar te chatten.
Ook is het mogelijk om uit de lijst met users een enkele user te selecteren om prive te chatten.
De app maakt gebruik van Socket.io. Dit maakt op een intuitieve manier een realtime, bidirectionele communicatie mogelijk.

Om deze app op je eigen machine te runnen heb je Node.js nodig: [how to install Node.js](https://nodejs.dev/en/learn/how-to-install-nodejs/)
Om de code uit te voeren moet je eerst in de correcte folder zijn. <br />
`cd chat-app` <br />
Vervolgens: <br />
`node .` <br />
Gebruikt automatisch index.js . En laat de gebruikte port zien.

Om de resulterende app te openen in een browser ga naar `http://localhost:{PORT}/chat.htm`, waarbij {PORT} vervangen moet worden. Waarschijnlijk deze [link](http://localhost:3000/chat.htm).

Deze app is gemaakt om mijn inzicht en vaardigheden te tonen.
Case omschrijving :
>We zouden graag een realtime chat applicatie zien dat gebruik maakt van socketio
>in NodeJs. Dat klinkt misschien als een flinke kluif maar beperk jezelf tot de core
>functionaliteit van berichtjes sturen.
> 
>De volgende functionele voorwaarden zijn van toepassing:
>  * Gebruikers moeten kunnen navigeren naar een startpagina waar ze vervolgens worden gevraagd om een gebruikersnaam op te geven waarna ze en chatroom kunnen betreden.
>  * Op het moment dat je de chatroom binnenstapt zie je het bericht “you joined chatroom-name” gebruikers die al aanwezig zijn in de chatroom zien het bericht: “gebruiker xyz joined the chat”.
>  * In de chatroom kun je zien hoeveel gebruikers en welke gebruikers aanwezig zijn
>  * Gebruikers kunnen prive berichten naar elkaar sturen.
>De volgende technische voorwaarden zijn van toepassing:
>  * Data hoeft niet persistent te zijn.

```
-front-end
	?one-page app
	-login page
		*dynamic
		-form
	-chat page
		*dynamic
		*scroll to new message v temporary new message bubble
		-side-bar
		-chat
			-bubble v discord style	
			*multi-line input
-back-end
	*socket.io
		-multiple clients at the same time
	*express
	-auth

todo:
	x-templat design
		x-top-bar
		x-side-bar
		x-main
	x-chat page
		-chat
			-bubble message

	x-chat input
	x-server/client communication.
	x-convert server answer to html element.
	xentry (login)
		xbackend
		xfrontend
	xrooms
		xbackend
		xfrontend
	-leave chat

current issues:
	-input is multi-line, but received msg is not.
```