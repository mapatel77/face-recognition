import React, {Component}from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation.js';
import Register from './components/Register/Register.js';
import Signin from './components/Signin/Signin.js';
import Logo from './components/Logo/Logo.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import ParticlesBg from 'particles-bg'

let config = {
  num: [4, 7],
  rps: 0.1,
  radius: [5, 40],
  life: [1.5, 3],
  v: [2, 3],
  tha: [-40, 40],
  // body: "./img/icon.png", // Whether to render pictures
  // rotate: [0, 20],
  alpha: [0.6, 0],
  scale: [1, 0.1],
  position: "all", // all or center or {x:1,y:1,width:100,height:100}
  color: ["random", "#ff0000"],
  cross: "dead", // cross or bround
  random: 15,  // or null,
  g: 5,    // gravity
  // f: [2, -1], // force
  onParticleUpdate: (ctx, particle) => {
      ctx.beginPath();
      ctx.rect(particle.p.x, particle.p.y, particle.radius * 2, particle.radius * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      ctx.closePath();
  }
};




const initialState = {
  input:"",
  imageUrl:"",
  box:{},
  route:'signin',
  isSignedIn: false,
  user: {
        id:'',
        name: '',
        email:'',
        entries: 0,
        joined:''
  }
}

class App extends Component {
  
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data)=>{

    this.setState({user:{
            id:data.id,
            name:data.name,
            email:data.email,
            entries: data.entries,
            joined:data.joined
    }});
  }

  calculateFaceLocation = (data) => { 
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
   
    return {

      leftCol : clarifaiFace.left_col * width,
      topRow  : clarifaiFace.top_row   * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height-(clarifaiFace.bottom_row * height)

    };
  };

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box:box});

  }   

  onInputChange = (event) => {
    this.setState({input:event.target.value});
  }

onButtonSubmit = () => {
 this.setState({imageUrl: this.state.input});
//const MODEL_ID = 'face-detection'; 
fetch('https://smart-brain-api-odza.onrender.com/imageurl', {
  method:"POST",
  headers:{'Content-Type':'application/json'},
  body : JSON.stringify({
  input : this.state.input
  })
})
  .then(response => response.json())
  .then(result =>{
    if(result){
      fetch('https://smart-brain-api-odza.onrender.com/image', {
        method:"PUT",
        headers:{'Content-Type':'application/json'},
        body : JSON.stringify({
        id:this.state.user.id
        })
      })
      .then(result=> result.json())
      .then(count=> {
        this.setState(Object.assign(this.state.user,{entries:count}))
      })
      .catch(console.log);
    }
   this.displayFaceBox(this.calculateFaceLocation(result))})
  .catch(error => console.log('error', error));

}

onRouteChange = (route) => {

    if (route === 'signout'){
      this.setState(initialState);
    }else if (route ==='home'){
      this.setState({isSignedIn: true});
    }
  this.setState({route:route});

}


  render(){
    return (
      <div className="App">
        <ParticlesBg type="circle" config={config} bg={true} />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange = {this.onRouteChange} />
        { this.state.route === 'home'
          ? <div>
            <Logo />
            <Rank name = {this.state.user.name} entries = {this.state.user.entries}/>
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
            <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
            </div>
          : (
            this.state.route === 'signin' 
            ? <Signin loadUser = {this.loadUser} onRouteChange= {this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange= {this.onRouteChange}/>
          )
          
          
         
            }

      </div>
    );

  }
  
};

export default App;
