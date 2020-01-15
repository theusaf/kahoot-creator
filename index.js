const request = require('request');
const userAgent = require('user-agents');
const jar = request.jar();
request = request.defaults(jar:jar);

const base = {
  id: null,
  kahootExists: false,
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
};

class Creator{
  constructor(useragent){
    this.userAgent = useragent ? useragent : new userAgent().toString();
    this.user = null;
    this.kahoot = base;
  }
  login(username,password){
    const me = this;
    return new Promise((res,rej)=>{
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
          rej(e);
        }
        try{
          const resp = JSON.parse(b);
          if(resp.error){
            rej(resp);
          }else{
            me.user = resp;
            request = request.defaults(jar:jar,headers:{
              "User-Agent": me.userAgent,
              "authorization": me.user.access_token
            });
            res(resp);
          }
        }catch(er){
          rej(er);
        }
      });
    });
  }
  load(id){
    const me = this;
    return new Promise((res,rej)=>{
      // GET https://create.kahoot.it/rest/kahoots/08bf2c68-858e-440c-a35d-43cd580f0c12
      // GET https://create.kahoot.it/rest/folders/2329c3ff-c1a0-4e74-bc2c-c65b6427f9e1/
      request.get(`https://create.kahoot.it/rest/kahoots/${id}`,(e,r,b)=>{
        if(e){
          rej(e);
        }
        try{
          const k = JSON.parse(b);
          if(k.error){
            return rej(k);
          }
          Object.assign(me.kahoot,k);
        }catch(e){
          rej(e);
        }
      });
    });
  }
  create(name){
    // POST https://create.kahoot.it/rest/drafts
  }
  update(){
    // PUT https://create.kahoot.it/rest/drafts/08bf2c68-858e-440c-a35d-43cd580f0c12
  }
  publish(){
    // POST https://create.kahoot.it/rest/drafts/08bf2c68-858e-440c-a35d-43cd580f0c12/publish
    // DELETE https://create.kahoot.it/rest/kahoots/08bf2c68-858e-440c-a35d-43cd580f0c12/lock
    // POST https://create.kahoot.it/rest/events/user
  }
  get questions(){
    const me = this;
    return me.kahoot.questions;
  }
}

module.exports = Creator;
