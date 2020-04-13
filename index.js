const userAgent = require('user-agents');
const base = {
  id: null,
  kahootExists: false,
  kahoot: {
    cover: "",
    coverMetadata: null,
    created: null,
    creator_username: "",
    description: "",
    folderId: "",
    introVideo: "",
    language: "English",
    lobby_video: {
      youtube: {
        id: "",
        fullUrl: "",
        startTime: 0
      }
    },
    metadata: {
      resolution: "",
      duplicationProtection: false,
      moderation: {
        flaggedTimestamp: 0,
        timestampResolution: 0
      },
      resolution: ""
    },
    organisation: null,
    questions: [
      {
        question: "",
        type: "quiz",
        layout: "CLASSIC",
        image: null,
        imageMetadata: null,
        choices: [],
        numberOfAnswers: 0,
        pointsMultiplier: 1,
        question: "",
        questionFormat: 0,
        resources: "",
        time: 20000,
        type: "quiz",
        video: {
          id: null,
          endTime: 0,
          startTime: 0,
          service: null,
          fullUrl: ""
        }
      }
    ],
    quizType: "quiz",
    resources: "",
    themeId: null,
    title: "",
    type: "quiz",
    uuid: null,
    visibility: 0
  }
};
const https = require('https');
const filetype = require('file-type');

// modified from:
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var tempArray = Array.from(array);
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = tempArray[currentIndex];
    tempArray[currentIndex] = tempArray[randomIndex];
    tempArray[randomIndex] = temporaryValue;
  }
  return tempArray;
}

class Creator{
  constructor(useragent){
    var request = require('request');
    this.jar = request.jar();
    request = request.defaults({jar:this.jar});
    this.userAgent = useragent ? useragent : new userAgent().toString();
    this.user = null;
    this.kahoot = JSON.parse(JSON.stringify(base));
    this.request = request;
    this.needsToCreateDraft = false;
  }
  // HTTP methods
  login(username,password){
    return new Promise((forty,two)=>{
      this.request.post({
        url: "https://create.kahoot.it/rest/authenticate",
        headers: {
          "User-Agent": this.userAgent,
          "x-kahoot-login-gate": "enabled"
        },
        json: true,
        body: {
          grant_type: "password",
          password: password,
          username: username
        }
      },(e,r,b)=>{
        if(e){
          two(e);
        }
        try{
          const resp = b;
          if(resp.error){
            two(resp);
          }else{
            this.user = resp;
            this.request = this.request.defaults({
              jar:this.jar,
              headers:{
                "User-Agent": this.userAgent,
                "authorization": "Bearer " + this.user.access_token
              }
            });
            forty(resp);
          }
        }catch(er){
          two(b,e);
        }
      });
    });
  }
  load(id){
    return new Promise((romeo,juliet)=>{
      this.request.get(`https://create.kahoot.it/rest/drafts/${id}`,{json:true},(e,r,b)=>{
        if(e){
          return juliet(e);
        }
        try{
          const j = b;
          if(!j.error){
            delete j.targetFolderId;
            delete j.type;
            delete j.created;
            delete j.modified;
            Object.assign(this.kahoot,j);
            this.needsToCreateDraft = false;
            return romeo(j);
          }
        }catch(e){
          return juliet(e);
        }
        this.request.get(`https://create.kahoot.it/rest/kahoots/${id}`,{json:true},(e,r,b)=>{
          if(e){
            juliet(e);
          }
          try{
            const k = b;
            if(k.error){
              return juliet(k);
            }
            Object.assign(this.kahoot.kahoot,k);
            this.needsToCreateDraft = true;
            this.kahoot.kahootExists = true;
            romeo(k);
          }catch(e){
            juliet(b,e);
          }
        });
      });
    });
  }
  create(name){
    return new Promise((toss,yeet)=>{
      if(!this.user){
        return yeet({error:"not logged in!"});
      }
      this.title = name ? name : "lorem ipsum";
      this.request.post("https://create.kahoot.it/rest/drafts",{json:true,body:this.kahoot},(e,r,b)=>{
        if(e){
          yeet(e);
        }
        try{
          const data = b;
          if(data.error){
            return yeet(data);
          }
          Object.assign(this.kahoot,data);
          toss(data);
        }catch(err){
          yeet(b,e);
        }
      });
    });
  }
  update(){
    return new Promise((my,stick)=>{
      if(!this.user){
        stick({error:"Not logged in!"});
      }
      if(this.needsToCreateDraft){
        this.request.post("https://create.kahoot.it/rest/drafts",{json:true,body:this.kahoot},(e,r,b)=>{
          if(e){
            stick(e);
          }
          try{
            const data = b;
            if(data.error){
              return stick(data);
            }
            Object.assign(this.kahoot,data);
            this.needsToCreateDraft = false;
            my(data);
          }catch(err){
            stick(b,e);
          }
        });
        return;
      }
      this.request.put(`https://create.kahoot.it/rest/drafts/${this.kahoot.kahoot.uuid}`,{body:this.kahoot,json:true},(e,r,b)=>{
        if(e){
          console.log(e);
          stick(e);
        }
        try{
          const resp = b;
          delete resp.targetFolderId;
          delete resp.type;
          delete resp.created;
          delete resp.modified;
          Object.assign(this.kahoot,resp);
          my(resp);
        }catch(e){
          console.log(b);
          console.log(e);
          stick(b,e);
        }
      });
    });
  }
  publish(){
    return new Promise((james,jessie)=>{
      if(!this.user){
        return jessie({error:"Not logged in!"});
      }
      // publish
      this.request.post(`https://create.kahoot.it/rest/drafts/${this.kahoot.id}/publish`,{body:this.kahoot,json:true},(e,r,b)=>{
        if(e){
          return jessie(e);
        }
        try{
          const data = b;
          if(data.error){
            return jessie(data);
          }
          Object.assign(this.kahoot.kahoot,data);
          // delete lock file
          this.request.delete(`https://create.kahoot.it/rest/kahoots/${this.kahoot.id}/lock`,{json:true},(e,r,b)=>{
            if(e){
              return jessie(e);
            }
            try{
              if(b.error){
                return jessie(b);
              }
            }catch(err){
              return jessie(b,err);
            }
            this.kahoot.id = null;
            this.needsToCreateDraft = true;
            return james(data);
          });
        }catch(err){
          return jessie(b,err);
        }
      });
    });
  }
  // Getters and setters for easier access
  get id(){
    return this.kahoot.kahoot.uuid;
  }
  get questions(){
    return this.kahoot.kahoot.questions;
  }
  get title(){
    return this.kahoot.kahoot.title;
  }
  set title(title){
    let slug = title.replace(/[^0-9a-z\ ]/gmi,"");
    slug = slug.replace(/\ */gm,"-");
    this.kahoot.kahoot.title = title;
    this.kahoot.kahoot.slug = slug;
    return title;
  }
  get quiz(){
    return this.kahoot.kahoot;
  }
  // Adding questions and modifying stuff
  removeQuestion(index){
    this.kahoot.kahoot.questions.splice(index,1);
    return this;
  }
  shuffleQuestions(){
    this.kahoot.kahoot.questions = shuffle(this.kahoot.kahoot.questions);
    return this;
  }
  addQuestion(question,type,choices){
    let cs = [];
    const quest = JSON.parse(JSON.stringify(base.kahoot.questions[0]));
    quest.type = type ? type : "quiz";
    quest.question = question;
    let content = undefined;
    switch (type) {
      case "word_cloud":
        cs = undefined;
        break;
      case "content":
        cs = undefined;
        quest.question = undefined;
        quest.title = question;
        content = choices.toString();
        break;
      case "jumble":
        if(choices){
          if(choices.length < 4){
            for(let i = 0;i<4-choices.length;++i){
              choices.push({answer:"",correct:true});
            }
          }
          cs = choices.slice(0,4);
          break;
        }
        cs = [{answer:"",correct:true},{answer:"",correct:true},{answer:"",correct:true},{answer:"",correct:true}];
        break;
      case "open_ended":
        cs = choices ? choices : [{answer:"",correct:true}]
        break;
      default:
        cs = choices ? choices.slice(0,4) : [{answer:"",correct:false},{answer:"",correct:false}];
    }
    quest.choices = cs;
    quest.description = content;
    quest.numberOfAnswers = choices ? choices.length : undefined;
    const ind = this.kahoot.kahoot.questions.push(quest) - 1;
    return this.kahoot.kahoot.questions[ind];
  }
  addChoice(question,choice,correct){
    switch (question.type) {
      case "jumble":
        if(question.choices.length >= 4){
          return question;
        }else if(question.choices.length < 4){
          question.choices.push({answer:choice,correct:true});
          for(let i = 0;i<4-question.choices.length;++i){
            question.choices.push({answer:"",correct:true});
          }
          question.numberOfAnswers = 4;
          return question;
        }
        break;
      case "content":
      case "word_cloud":
        return question;
        break;
      case "open_ended":
        if(choice.length > 20){
          console.warn("Warning: This choice is too long, meaning that normal kahoot players won't be able to answer this quesiton.");
        }
        question.choices.push({answer:choice,correct:correct});
        question.numberOfAnswers = question.choices.length;
        return question;
        break;
      default:
        if(question.choices.length >= 4){
          return question;
        }
        question.choices.push({answer:choice,correct:correct});
        question.numberOfAnswers = question.choices.length;
        return question;
    }
  };
  // images
  upload(img){
    return new Promise((creeper,awman)=>{
      filetype.fromBuffer(img).then(type=>{
        this.request.post(`https://apis.kahoot.it/media-api/media/upload?_=${Date.now()}`,{
          encoding: null,
          formData: {
            f: {
              value: Buffer.from(img),
              options: {
                filename: `image.${type.ext}`,
                contentType: type.mime
              }
            }
          }
        },(e,r,b)=>{
          if(e){
            awman(e);
          }
          try{
            creeper(JSON.parse(b.toString()));
          }catch(e){
            awman(b,e);
          }
        });
      });
    });
  }
  setQuizImage(buf){
    return new Promise((asuna,kirito)=>{
      if(typeof buf == "string"){
        this.request.get(buf,{encoding: null},(e,r,b)=>{
          if(e){
            return kirito(b,e);
          }
          this.upload(b).then(info=>{
            console.log(info);
            this.quiz.cover = `https://media.kahoot.it/${info.id}`;
            if(!this.quiz.coverMetadata){
              this.quiz.coverMetadata = {};
            }
            Object.assign(this.quiz.coverMetadata,{
              id: info.id,
              contentType: info.contentType,
              width: info.width,
              height: info.height
            });
            asuna(this);
          }).catch(err=>{
            kirito(err);
          });
        });
      }else{
        this.upload(Buffer.from(buf)).then(info=>{
          this.quiz.cover = `https://media.kahoot.it/${info.id}`;
          if(!this.quiz.coverMetadata){
            this.quiz.coverMetadata = {};
          }
          Object.assign(this.quiz.coverMetadata,{
            id: info.id,
            contentType: info.contentType,
            width: info.width,
            height: info.height
          });
          asuna(this);
        }).catch(err=>{
          kirito(err);
        });
      }
    });
  }
  setQuestionImage(question,buf){
    return new Promise((misty,ash)=>{
      if(typeof buf == "string"){
        this.request.get(buf,{encoding:null},(e,r,b)=>{
          if(e){
            return ash(b,e);
          }
          this.upload(b).then(info=>{
            question.image = `https://media.kahoot.it/${info.id}`;
            if(!question.imageMetadata){
              question.imageMetadata = {};
            }
            question.imageMetadata = {
              id: info.id,
              contentType: info.contentType,
              width: info.width,
              height: info.height
            };
            misty(question);
          }).catch(err=>{
            ash(err);
          });
        });
      }else{
        this.upload(Buffer.from(buf)).then(info=>{
          question.image = `https://media.kahoot.it/${info.id}`;
          if(!question.imageMetadata){
            question.imageMetadata = {};
          }
          question.imageMetadata = {
            id: info.id,
            contentType: info.contentType,
            width: info.width,
            height: info.height
          };
          misty(this);
        }).catch(err=>{
          ash(err);
        });
      }
      return this;
    });
  }
  addImageChoice(question,choice,correct){
    const summon = (info,yes,no)=>{
      switch (question.type) {
        case "jumble":
          if(question.choices.length >= 4){
            return question;
          }else if(question.choices.length < 4){
            question.choices.push({
              answer:"",
              correct:true,
              image:{
                id: info.id,
                contentType: info.contentType,
                width: info.width,
                height: info.height
              }
            });
            for(let i = 0;i<4-question.choices.length;++i){
              question.choices.push({answer:"",correct:true});
            }
            question.numberOfAnswers = 4;
            return question;
          }
          break;
        case "content":
        case "word_cloud":
          return question;
          break;
        case "open_ended":
          return question;
          break;
        default:
          if(question.choices.length >= 4){
            return question;
          }
          question.choices.push({
            answer:"",
            correct:correct,
            image:{
              id: info.id,
              contentType: info.contentType,
              width: info.width,
              height: info.height
            }
          });
          question.numberOfAnswers = question.choices.length;
          return question;
      }
      yes(question);
    };
    return new Promise((no,yes)=>{
      if(typeof choice == "string"){
        this.request.get(buf,{encoding:null},(e,r,b)=>{
          if(e){
            yes(e);
          }
          this.upload(b).then(info=>{
            summon(info,no,yes);
          }).catch(err=>{
            yes(err);
          });
        });
      }else{

      }
    });
  }
  // metadata stuff
  setLobbyVideo(id,start,end){
    Object.assign(this.quiz.lobby_video.youtube,{
      id: id,
      startTime: start,
      endTime: end,
      service: "youtube",
      fullUrl: `https://www.youtube.com/watch?v=${id}`
    });
    return this;
  }
  setQuestionVideo(question,id,start,end){
    Object.assign(question.video,{
      id: id,
      startTime: start,
      endTime: end,
      service: "youtube",
      fullUrl: `https://www.youtube.com/watch?v=${id}`
    });
    return question;
  }
}

module.exports = Creator;
