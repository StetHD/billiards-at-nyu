Description
-----------------------

My project consists of a web app to provide scoring and tournament stats to
players in Billiards@NYU. Billiards@NYU is a big society currently based
around a simple Facebook group, which does not necessarily provide a good
platform for players to access and find information on the club and its
events. This website will provide a central area for news and information in
the club to be released, as well as a hub for players to access stats and
game information.

User Stories
-----------------------

- Guests will be able to view information on the club and current tournament
stats.
- Players will be able to register and attach their accounts to tournament
symbols, and keep, as well as access a record of all their past tournament
results, current rankings, etc.
- Club administrators will be able to post/upload news and announcements for
players and guests in a central area.

Sample Documents
----------------------

Player: {"playerid":Number,
	 "playerName":String,
	 "playerRank":Number,
	 "partTourneys":[String]} // Relational reference to tournaments
					database

Tournament: { Still need to figure this out :/
	     }

Post: {"postid":Number,
       "title":String,
       "content":String,
       "slug":String}

Modules/Concepts to Research
-------------------------------------

- User Authentication

User Authentication, referring to the ability for users to create a profile
and log in and use that profile as an identity. The most important part of
this module would probably be security issues; the storage of the identity
also needs to be worked out properly.

Possible modules: Passport?

- Embedded Media Serving

Possible serving videos, flash animations, more interactive content; likely
can be done in the same way as images, but embedding may require a little
more thinking - security of the media is an issue?

- In page server-client communication

Trying to communicate between server and client without requiring the usage
of GET and POST methods, i.e. interactive communication with server fully
integrated into page; this may be ambitious, depending on the turnout of
research. Possible things to consider would be how long to keep connections
open, how resource intensive that would be on the server/clients, the thread-
safety of such techniques. This would provide for a much more immersive
experience for users, and allow for intuitive interaction with mainly the
tournament management features aimed at tourney players.

Site Map
---------------------------

![Site Map V1](/documentation/BilliardsNYUSiteMap1.png?raw=true)
