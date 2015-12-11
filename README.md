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

```javascript
// Node schemas to softly implement
// Node structure
// (n:MainLabel[:OptionalLabels] {
//	property1: Type,
//	property2: Type
// }

(n:User[:Admin] {
	username: String,
	password: String,
	email: String,
})

(n:Player {
	playername: String,
	playerrank: Number
})

(n:Match {
	raceto: Number,
	player1score: Number,
	player2score: Number,
        games: [Number] //1 for player1 win, 2 for player2 win
})

(n:Tournament {
	semester: String
})

(n:Post {
	postnumber: Number,
	title: String,
	date: Number,
	content: String,
	slug: String
})

// Relationship schemas to softly implement
// Relationship structure
//(n:MainLabel)<-[r:RELATIONSHIP_TYPE { property1: Type, property2: Type }]->
//(n2:MainLabel)

(n:User)-[r:PLAYS_AS]->(n2:Player)

(n:Player)-[r:PLAYED_IN { playernumber: Number }]->(n2:Match)

(n:Match)-[r:PART_OF { roundof: Number, matchnumber: Number }]->
(n2:Tournament)

(n:Player)-[r:WON]->(n2:Tournament)

(n:Post)-[r:ABOUT]->(n2[:Player:Match:Tournament])
```

Modules/Concepts to Research
-------------------------------------

- User Authentication (3 Points)

User Authentication, referring to the ability for users to create a profile
and log in and use that profile as an identity. The most important part of
this module would probably be security issues; the storage of the identity
also needs to be worked out properly.

Modules: Passport, Crypto

- User Authorization (1 Point)

User Authorization, allowing for only certain users with certain labels attached
to their account to access certain pages; for example, only allowing administrators
to make new posts on the homepage or to edit the tournament contents. Restricting
access to these pages is important to control the quality of the content of
the webpage. I will be implementing this myself with the help of the Passport
req.user object.

Modules: Express Session

- CSS Preprocessor (1 Point)

A CSS preprocessor allows me to write in more concise and interactive CSS
code, converting it into proper CSS after finishing and before serving to
the client. This will make for a more organized and easier to manage stylesheet,
which should simplify building the CSS framework for the site. I will likely
be using SASS for this, as it has a pretty simple and well documented API.

Preprocessor: SASS

- Relational Database - neo4j (3 points - possibly 4 for complexity?)

Mongodb stores records as 'documents' in collections, which are not inherently
connected to each other throughout connections; it is possible to store ids to
a document in another connection to establish a sort of relational link, or to
store documents of another collection inside of a document, but storing ids is
not directly supported by mongo and storing documents does not allow for
circular references. Therefore, I will be looking to work with a graph
database, neo4j, using the cypher query language and the Node-Neo4j module.

This is arguably 4 points or more, as it entails learning to use an entirely
new database that functions under a different concept, learning to utilize a
query language similar to SQL, as well as a new driver that connects express and
the database.

Modules: Node-Neo4j v2

Authorization
---------------------------

Three user groups required :

- Guests
- Players
- Administrators

Guests can access:

- Home
- About
- Tournament
- Players-Lookup
- Login
- Register

Players can access:

- Personal Profile Page
- Record Match

Admins can access:

- Home-New Posts
- Tournament-New-Edit
- DBquery

Site Map
---------------------------

![Site Map V1](/documentation/BilliardsNYUSiteMap1.png?raw=true)


Wireframes
--------------------------

![Wireframes 1](/documentation/Wireframes1.png?raw=true)
![Wireframes 2](/documentation/Wireframes2.png?raw=true)


Debug Purpose ONLY Pages
--------------------------

/testing - Page displays the current req.user object
/makeadmin - Makes the current user into an administrator