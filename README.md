# Kahoot Creator
Create Kahoots using JavaScript<br>
*This is not the same as `kahoot-session`, which runs kahoot quizzes for players to join.*
## Example Usage
```js
const KahootCreator = require("kahoot-creator");
const creator = new KahootCreator();

creator.login("username","password").then(()=>{
  creator.create("my first quiz!").then((kahoot)=>{
    // handling stuff, adding questions, publishing, etc
  });
});
```
### Methods
- constructor(user_agent)
  - `user_agent`: A user agent to use for the login. This gets set randomly if not provided.
- login(username,password)
  - Logs in to kahoot
  - `username`: The user's kahoot username
  - `password`: The user's kahoot password
- create(name)
  - Creates a new kahoot
  - `name`: The name of the kahoot. If left blank, defaults to `lorem ipsum`
- load(id)
  - Loads a kahoot to edit
  - `id`: The id of the quiz to load. Users may need to update the information of the kahoot if the kahoot they are loading does not belong to them.
- update()
  - Saves the kahoot draft
- publish()
  - Saves the kahoot and publishes it
  - This does **not** mean that the kahoot is public. You need to set the kahoot's publicity using `creator.quiz.visibility`
- shuffleQuestions()
  - Shuffles the questions randomly.
  - returns: `creator` (itself)
- addQuestion(question,type,choices)
  - Adds a question to the quiz. Also, automatically adds choices and sets `numberOfAnswers`
  - `question`: What the question is going to ask
  - `type`: The type of question. Valid options are: `quiz`, `jumble`, `content`, `word_cloud`, `open_ended`. Defaults to `quiz`
  - `choices`: An array of choices. Should look somewhat like this:
    - `[{answer:"True",correct:false},{answer:"False",correct:true}]`
    - **Special Case: `content`** - For content slides, `choices` should be a string.
  - returns: `question` (the question that was just added)
- removeQuestion(index)
  - remove the question at the specified index
  - returns: `creator` (itself)
- addChoice(question,choice,correct)
  - `question`: The question to add a choice to.
  - `choice`: The choice being added
  - `correct`: Whether the choice is correct
  - returns: `question` (the question that the choice was added to)
- setLobbyVideo(id,start,end)
  - `id`: The id of the YouTube video
  - `start`: The start time in seconds
  - `end`: The end time in seconds
- setQuestionVideo(question,id,start,end)
  - `id`: The id of the YouTube video
  - `start`: The start time in seconds
  - `end`: The end time in seconds

### Properties
- `id`: The uuid of the current kahoot quiz
- `questions`: The questions of the kahoot
  - When the class is created, it will automatically have an empty `quiz` question.
- `quiz`: The kahoot
- `title`: The title of the kahoot
  - **It is recommended to use this property to set the name of the quiz. (It automatically sets the 'slug' of the kahoot for you)**
### Information
- Most methods return a `Promise` (unless specified otherwise)
