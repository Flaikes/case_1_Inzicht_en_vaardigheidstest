#case_1_inzicht_en_vaardigheidstest

We zouden graag een realtime chat applicatie zien dat gebruik maakt van socketio
in NodeJs. Dat klinkt misschien als een flinke kluif maar beperk jezelf tot de core
functionaliteit van berichtjes sturen.

De volgende functionele voorwaarden zijn van toepassing:
	-Gebruikers moeten kunnen navigeren naar een startpagina waar ze vervolgens
	worden gevraagd om een gebruikersnaam op te geven waarna ze een chatroom
	kunnen betreden.
	-Op het moment dat je de chatroom binnenstapt zie je het bericht “you joined
	chatroom-name” gebruikers die al aanwezig zijn in de chatroom zien het bericht:
	“gebruiker xyz joined the chat”.
	-In de chatroom kun je zien hoeveel gebruikers en welke gebruikers aanwezig
	zijn
	-Gebruikers kunnen prive berichten naar elkaar sturen.
De volgende technische voorwaarden zijn van toepassing:
	-Data hoeft niet persistent te zijn.

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
	-entry (login)
		-backend
		-frontend
	-rooms
		-backend
		-frontend
	-leave chat

current issues:
	-input is multi-line, but received msg is not.