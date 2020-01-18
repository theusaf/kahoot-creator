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
    var request = require('me.request');
    const jar = request.jar();
    request = request.defaults({jar:jar});
    this.userAgent = useragent ? useragent : new userAgent().toString();
    this.user = null;
    this.kahoot = Object.assign({},base);
    this.request = request;
  }
  // HTTP methods
  login(username,password){
    const me = this;
    return new Promise((forty,two)=>{
      me.me.request.post({
        url: "https://create.kahoot.it/rest/authenticate",
        headers: {
          "User-Agent": me.userAgent,
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
            me.user = resp;
            me.request = me.request.defaults({
              jar:jar,
              headers:{
                "User-Agent": me.userAgent,
                "authorization": me.user.access_token
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
    const me = this;
    return new Promise((romeo,juliet)=>{
      me.request.get(`https://create.kahoot.it/rest/drafts/${id}`,{json:true},(e,r,b)=>{
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
            Object.assign(me.kahoot,j);
            return romeo(j);
          }
        }catch(e){
          return juliet(e);
        }
        me.request.get(`https://create.kahoot.it/rest/kahoots/${id}`,{json:true},(e,r,b)=>{
          if(e){
            juliet(e);
          }
          try{
            const k = JSON.parse(b);
            if(k.error){
              return juliet(k);
            }
            Object.assign(me.kahoot.kahoot,k);
            me.kahoot.kahootExists = true;
            romeo(k);
          }catch(e){
            juliet(b,e);
          }
        });
      });
    });
  }
  create(name){
    const me = this;
    return new Promise((toss,yeet)=>{
      if(!me.user){
        return yeet({error:"not logged in!"});
      }
      me.title = name ? name : "lorem ipsum";
      me.request.post("https://create.kahoot.it/rest/drafts",{json:true,body:me.kahoot},(e,r,b)=>{
        if(e){
          yeet(e);
        }
        try{
          const data = b;
          if(data.error){
            return yeet(data);
          }
          Object.assign(me.kahoot,data);
          toss(data);
        }catch(err){
          yeet(b,e);
        }
      });
    });
  }
  update(){
    const me = this;
    return new Promise((my,stick)=>{
      if(!me.user){
        stick({error:"Not logged in!"});
      }
      me.request.put(`https://create.kahoot.it/rest/drafts/${me.kahoot.kahoot.uuid}`,{body:me.kahoot,json:true},(e,r,b)=>{
        if(e){
          stick(e);
        }
        try{
          const resp = b;
          delete resp.targetFolderId;
          delete resp.type;
          delete resp.created;
          delete resp.modified;
          Objcet.assign(me.kahoot,resp);
          my(resp);
        }catch(e){
          stick(b,e);
        }
      });
    });
  }
  publish(){
    const me = this;
    return new Promise((james,jessie)=>{
      if(!me.user){
        return jessie({error:"Not logged in!"});
      }
      // publish
      me.request.post(`https://create.kahoot.it/rest/drafts/${me.kahoot.id}/publish`,{body:me.kahoot,json:true},(e,r,b)=>{
        if(e){
          return jessie(e);
        }
        try{
          const data = b;
          if(data.error){
            return jessie(e);
          }
          Object.assign(me.kahoot.kahoot,data);
          // delete lock file
          me.request.delete(`https://create.kahoot.it/rest/drafts/${me.kahoot.it}/lock`,{json:true},(e,r,b)=>{
            if(e){
              return jessie(e);
            }
            try{
              if(b.error){
                return jessie(JSON.parse(b).error);
              }
            }catch(err){
              return jessie(b,err);
            }
            me.kahoot.id = null;
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
    const me = this;
    return me.kahoot.kahoot.uuid;
  }
  get questions(){
    const me = this;
    return me.kahoot.kahoot.questions;
  }
  get title(){
    const me = this;
    return me.kahoot.kahoot.title;
  }
  set title(title){
    const me = this;
    let slug = title.replace(/[^0-9a-z\ ]/gmi,"");
    slug = slug.replace(/\ */gm,"-");
    me.kahoot.kahoot.title = title;
    me.kahoot.kahoot.slug = slug;
    return title;
  }
  get quiz(){
    return this.kahoot.kahoot;
  }
  // Adding questions and modifying stuff
  removeQuestion(index){
    const me = this;
    me.kahoot.kahoot.questions.splice(index,1);
    return me;
  }
  shuffleQuestions(){
    const me = this;
    me.kahoot.kahoot.questions = shuffle(me.kahoot.kahoot.questions);
    return me;
  }
  addQuestion(question,type,choices){
    const me = this;
    let cs = [];
    const quest = Object.assign({},base.kahoot.questions[0]);
    quest.type = type ? type : "quiz";
    quest.question = question;
    let content = undefined;
    switch (type) {
      case "word_cloud":
        cs = undefined;
        break;
      case "content":
        cs = undefined;
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
    const ind = me.kahoot.kahoot.questions.push(quest) - 1;
    return me.kahoot.kahoot.questions[ind];
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
  // metadata stuff
  setLobbyVideo(id,start,end){
    const me = this;
    Object.assign(me.quiz.lobby_video.youtube,{
      id: id,
      startTime: start,
      endTime: end,
      service: "youtube",
      fullUrl: `https://www.youtube.com/watch?v=${id}`
    });
    return me;
  }
  upload(img){
    const me = this;
    return new Promise((res,ponse)=>{
      const form = {
        my_buffer: img
      };
      me.request.post(`https://apis.kahoot.it/media-api/media/upload?_=${Date.now()}`,{
        formData: form,
        encoding: null
      },(e,r,b)=>{
        if(e){
          return ponse(b,e);
        }
        try{
          const urrect = JSON.parse(b);
          if(urrect.error){
            return ponse(b);
          }
          res(urrect);
        }catch(e){
          ponse(b,e);
        }
      });
    });
  }
  setQuizImage(buf){
    const me = this;
    return new Promise((asuna,kirito)=>{
      if(typeof buf == "string"){
        me.request.get(buf,(e,r,b)=>{
          if(e){
            return kirito(b,e);
          }
          me.upload(b).then(info=>{
            me.quiz.cover = `https://media.kahoot.it/${info.id}`;
            Object.assign(me.quiz.coverMetadata,{
              id: info.id,
              contentType: info.contentType,
              width: info.width,
              height: info.height
            });
            asuna(me);
          }).catch(err=>{
            kirito(err);
          });
        });
      }else{
        me.upload(Buffer.from(buf)).then(info=>{
          me.quiz.cover = `https://media.kahoot.it/${info.id}`;
          Object.assign(me.quiz.coverMetadata,{
            id: info.id,
            contentType: info.contentType,
            width: info.width,
            height: info.height
          });
          asuna(me);
        }).catch(err=>{
          kirito(err);
        });
      }
    });
  }
  setQuestionVideo(question,id,start,end){
    const me = this;
    Object.assign(question.video,{
      id: id,
      startTime: start,
      endTime: end,
      service: "youtube",
      fullUrl: `https://www.youtube.com/watch?v=${id}`
    });
    return question;
  }
  setQuestionImage(question,buf){
    const me = this;
    return new Promise((misty,ash)=>{
      if(typeof buf == "string"){
        me.request.get(buf,{encoding:null},(e,r,b)=>{
          if(e){
            return ash(b,e);
          }
          me.upload(b).then(info=>{
            question.cover = `https://media.kahoot.it/${info.id}`;
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
        me.upload(Buffer.from(buf)).then(info=>{
          question.cover = `https://media.kahoot.it/${info.id}`;
          question.imageMetadata = {
            id: info.id,
            contentType: info.contentType,
            width: info.width,
            height: info.height
          };
          misty(me);
        }).catch(err=>{
          ash(err);
        });
      }
      return me;
    });
  }
}

module.exports = Creator;
