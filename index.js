const request = require('request');
const userAgent = require('user-agents');
const jar = request.jar();
request = request.defaults({jar:jar});

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

class Creator{
  constructor(useragent){
    this.userAgent = useragent ? useragent : new userAgent().toString();
    this.user = null;
    this.kahoot = base;
  }
  login(username,password){
    const me = this;
    return new Promise((forty,two)=>{
      request.post({
        url: "https://create.kahoot.it/rest/authenticate",
        headers: {
          "User-Agent": me.userAgent,
          "x-kahoot-login-gate": "enabled"
        }
      }).form({
        grant_type: "password",
        password: password,
        username: username
      },(e,r,b)=>{
        if(e){
          two(e);
        }
        try{
          const resp = JSON.parse(b);
          if(resp.error){
            two(resp);
          }else{
            me.user = resp;
            request = request.defaults({
              jar:jar,
              headers:{
                "User-Agent": me.userAgent,
                "authorization": me.user.access_token
              }
            });
            forty(resp);
          }
        }catch(er){
          two(er);
        }
      });
    });
  }
  load(id){
    const me = this;
    return new Promise((romeo,juliet)=>{
      request.get(`https://create.kahoot.it/rest/drafts/${id}`,(e,r,b)=>{
        if(e){
          return juliet(e);
        }
        try{
          const j = JSON.parse(b);
          if(j.error){
            return juliet(j);
          }
          delete j.targetFolderId;
          delete j.type;
          delete j.created;
          delete j.modified;
          Object.assign(me.kahoot,j);
          return romeo(j);
        }catch(e){
          return juliet(e);
        }
        request.get(`https://create.kahoot.it/rest/kahoots/${id}`,(e,r,b)=>{
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
            juliet(e);
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
      request.post("https://create.kahoot.it/rest/drafts").form(this.kahoot,(e,r,b)=>{
        if(e){
          yeet(e);
        }
        try{
          const data = JSON.parse(b);
          if(data.error){
            return yeet(data);
          }
          Object.assign(me.kahoot,data);
          toss(data);
        }catch(err){
          yeet(e);
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
      request.put(`https://create.kahoot.it/rest/drafts/${me.kahoot.kahoot.uuid}`).form(me.kahoot,(e,r,b)=>{
        if(e){
          stick(e);
        }
        try{
          const resp = JSON.parse(b);
          delete resp.targetFolderId;
          delete resp.type;
          delete resp.created;
          delete resp.modified;
          Objcet.assign(me.kahoot,resp);
          my(resp);
        }catch(e){
          stick(e);
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
      request.post(`https://create.kahoot.it/rest/drafts/${me.kahoot.id}/publish`).form(me.kahoot,(e,r,b)=>{
        if(e){
          return jessie(e);
        }
        try{
          const data = JSON.parse(b);
          if(data.error){
            return jessie(e);
          }
          Object.assign(me.kahoot.kahoot,data);
          // delete lock file
          request.delete(`https://create.kahoot.it/rest/drafts/${me.kahoot.it}/lock`,(e,r,b)=>{
            if(e){
              return jessie(e);
            }
            try{
              if(JSON.parse(b).error){
                return jessie(JSON.parse(b).error);
              }
            }catch(err){
              return jessie(err);
            }
            return james(data);
          });
        }catch(err){
          return jessie(err);
        }
      });
    });
  }
  get id(){
    const me = this;
    return me.kahoot.kahoot.uuid;
  }
  get questions(){
    const me = this;
    return me.kahoot.kahoot.questions;
  }
}

module.exports = Creator;
