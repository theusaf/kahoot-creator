const path = require('path');
const rl = require('readline');
const c = require(path.join(__dirname,"../index.js"));
let b = new c;

const q = rl.createInterface({
  input: process.stdin,
  output: process.stdout
});

q.question("Enter Username: ",n=>{
  q.question("Enter Password: ",p=>{
    b.login(n,p).then(main).catch(() => {
      console.log("400 - Invalid credentials.");
      q.close();
    });
  });
});

function main(){
  q.question("What would you like to do? ",a=>{
    switch (a) {
      case "set":
        return q.question("What to set? ",s=>{
          q.question("What to set it to? ",v=>{
            try{
              eval(`b${s} = ${v}`);
            }catch(e){}
            main();
          });
        });
      case "log":
        return q.question("What to log? ",l=>{
          try{
            eval(`console.log(b${l})`);
          }catch(e){}
          main();
        });
        break;
      case "load":
        return q.question("Please enter the id of the kahoot to load: ",id=>{
          b.load(id).then(()=>{
            main();
          }).catch(()=>{
            console.log("There was an error loading the kahoot.");
            main();
          });
        });
        break;
      case "save":
      case "update":
        return b.update().then(()=>{
          main();
        }).catch(e=>{
          console.log("There was an error while updating the draft: " + e);
          main();
        });
        break;
      case "publish":
        return b.publish().then(()=>{
          main();
        }).catch(e=>{
          console.log("There was an error while publishing the kahoot: " + JSON.stringify(e));
          main();
        });
        break;
      case "create":
        return q.question("Please enter the name of the quiz: ",n=>{
          b.create(n).then(()=>{
            main();
          }).catch(e=>{
            console.log("There was an error while created the quiz: " + e);
            main();
          });
        });
        break;
      case "done":
      case "exit":
      case ":q":
        q.close();
        return;
        break;
      case "shuffle":
        b.shuffleQuestions();
        break;
      case "question":
      case "addQuestion":
        return q.question("Enter the question: ",qu=>{
          q.question("Enter the question type: ",t=>{
            q.question("Enter the choices: ",cs=>{
              try{
                console.log(b.addQuestion(qu,t,JSON.parse(cs)));
                main();
              }catch(err){
                console.log("There was a syntax error in your choices.");
                main();
              }
            });
          });
        });
        break;
      case "remove":
      case "removeQuestion":
      case "delQuestion":
      case "deleteQuestion":
        return q.question("Which question to remove? ",i=>{
          try{
            b.removeQuestion(i - 1);
          }catch(err){
            console.log("Invalid index");
          }
          main();
        });
        break;
      case "addAnswer":
      case "answer":
      case "choice":
      case "addChoice":
        return q.question("Would you like to use text or image? ",o=>{
          if(o=="text"){
            q.question("Which question number to add the question to? ",n=>{
              q.question("Is this choice correct (true|false)? ",bo=>{
                q.question("What is the choice? ",ch=>{
                  try{
                    console.log(b.addChoice(b.questions[n-1],ch,bo == "true"));
                  }catch(err){
                    console.log("An error ocurred");
                  }
                  main();
                });
              });
            });
          }else{
            q.question("Which question number to add the question to? ",n=>{
              q.question("Is this choice correct (true|false)? ",bo=>{
                q.question("What is the URL of the image?",u=>{
                  try{
                    b.addImageChoice(b.questions[n-1],u,bo == "true").then(qu=>{
                      console.log(qu);
                      main();
                    }).catch(e=>{
                      console.log(e);
                      console.log("There was an error uploading the image");
                      main();
                    });
                  }catch(e){
                    console.log("There was an error");
                    main();
                  }
                });
              });
            });
          }
        });
        break;
      case "lobby":
        return q.question("enter the id of the youtube video: ",v=>{
          q.question("enter the start and end time for the video, split by comma: ",t=>{
            try{
              const s = Number(t.split(",")[0]);
              const e = Number(t.split(",")[1]);
              b.setLobbyVideo(v,s,e);
              main();
            }catch(e){
              console.log("Error. Please use '0,0' for no end or start");
              main();
            }
          });
        });
        break;
      case "questionVideo":
        return q.question("Enter the id of the youtube video: ",v=>{
          q.question("Enter the start and end time for the video, split by comma: ",t=>{
            try{
              const s = Number(t.split(",")[0]);
              const e = Number(t.split(",")[1]);
              q.question("Which qusetion number to put the video on? ",q=>{
                try{
                  b.setQuestionVideo(b.questions[q-1],v,s,e);
                  main();
                }catch(err){
                  console.log("Invalid index.");
                  main();
                }
              });
            }catch(e){
              console.log("Error. Please use '0,0' for no end or start");
              main();
            }
          });
        });
        break;
      case "cover":
      case "coverImage":
      case "quizImage":
        return q.question("Enter the image URL to use: ",u=>{
          b.setQuizImage(u).then(()=>{
            main();
          }).catch(()=>{
            console.log("There was an error");
            main();
          });
        });
        break;
      case "questionImage":
        return q.question("Enter the image URL to use: ",u=>{
          q.question("Enter question number to use: ",n=>{
            try{
              b.setQuestionImage(b.questions[n-1],u).then(()=>{
                main();
              }).catch(e=>{
                console.log("There was an error uploading the image.");
                main();
              });
            }catch(e){
              console.log("Invalid index");
              main();
            }
          });
        });
        break;
      case "help":
      default:
        console.log([
          "help - this",
          "done - exit",
          "create - create a new kahoot",
          "load - load a kahoot",
          "update - save changes to draft",
          "publish - publish changes",
          "log - see contents of the kahoot",
          "set - set contents of the kahoot",
          "question - add a new question",
          "removeQuestion - remove a question",
          "choice - add an answer",
          "lobby - set lobby video",
          "questionVideo - set question video",
          "questionImage - set question image",
          "coverImage - set quiz image"
        ]);
    }
    main();
  });
}
