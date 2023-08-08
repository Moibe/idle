import {initializeApp } from 'firebase/app'

import {
    getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, getAdditionalUserInfo,
  } from 'firebase/auth'

import {
  getFirestore, collection, getDocs, doc, getDoc, addDoc,
  query, where, documentId, onSnapshot
} from 'firebase/firestore'
  

const firebaseConfig = {
    apiKey: "AIzaSyAq9PXaK2yBv5WJPCxN2ftYsIS6xmEJMTQ",
    authDomain: "glassboilerplate.firebaseapp.com",
    projectId: "glassboilerplate",
    storageBucket: "glassboilerplate.appspot.com",
    messagingSenderId: "1059418877993",
    appId: "1:1059418877993:web:39af816079c772b8822c38"
  };

initializeApp(firebaseConfig)

//init auth services 
const auth = getAuth()

const textoContainer = document.getElementById('texto-container');
const imageContainer = document.getElementById('image-container');
const glassCanvasB = document.getElementById('glassCanvasB');

onAuthStateChanged(auth, (user) => {
  console.log("Nuevo estatus de usuario:")
  console.log("variable user dentro del onAuth es:", user)
  //Si hay un usuario logueado:
  if (user !== null) { 
    
    verificaSuRegistro(user).then(docRefFinal => {

     if(docRefFinal == null){
        agregarNuevoUsuario(user).then(() => {
          console.log("Ya agregué al usuario.")
          console.log("ESTOY HACIENDO EL TRONCO COMÚN A...")
          verificaSuRegistro(user).then(docRefFinal => {
            obtenSusTokens(docRefFinal).then(resultado => {
              console.log("Los tokens que tiene son:", resultado)
              textoContainer.textContent = resultado;
              obtenDatosUsuario(user);
              suscribeteACambiosUsuario(docRefFinal);
            })
          })
        })
      }
      else{
        console.log("ESTOY HACIENDO EL TRONCO COMÚN B...")
        obtenSusTokens(docRefFinal).then(resultado => {
          console.log("Los tokens que tiene son:", resultado)
          textoContainer.textContent = resultado;
          obtenDatosUsuario(user);
          suscribeteACambiosUsuario(docRefFinal);
        })
      }
      })
  } 
  else{
        console.log("No hay usuario logueado.")
        reseteaDatosUsuario();
      }
})

function suscribeteACambiosUsuario(referenciaADocumento){
// Suscribirse al documento utilizando onSnapshot()
const unsubscribe = onSnapshot(referenciaADocumento, (doc) => {
  // Esta función se ejecutará cada vez que se produzcan cambios en el documento
  if (doc.exists()) {
    console.log("Documento actualizado:", doc.data());
    textoContainer.textContent = doc.data().tokens + " tokens"
  } else {
    console.log("El documento no existe.");
  }
});
}


function obtenDatosUsuario(user){
 
  const photo = user.photoURL;
  const imageUrl = photo; 
  const image = document.createElement('img');
  image.src = imageUrl;
  imageContainer.appendChild(image);
 }

function reseteaDatosUsuario(){
  const imageElement = imageContainer.querySelector('img');
  if (imageElement) {
    imageContainer.removeChild(imageElement);
  }
  
  textoContainer.innerText = ""
}

async function verificaSuRegistro(usuario) {
  
  var resultado
  var docRefFinal
  const q = query(colRef, where("uid", "==", usuario.uid))
  
  await getDocs(q).then(querySnapshot => {

  if (!querySnapshot.empty) {
    const documentSnapshot = querySnapshot.docs[0];
    const documentId = documentSnapshot.id;
    console.log("Y el documentId es:", documentId)
    // Ahora puedes crear una referencia hacia el documento utilizando el ID obtenido
    const docRef = doc(db, 'users', documentId);
    console.log("Y el docRef es: ", docRef)
    docRefFinal = docRef; 

  } else {
    console.log('No se encontraron documentos que coincidan con la consulta.');
    
  }  

  })

  return docRefFinal;
 
  }

  async function agregarNuevoUsuario(usuario){
    
  addDoc(colRef, {
      uid: usuario.uid,
      correo: usuario.email,
      tokens: 100
    }).then(objeto => {
      console.log("NUEVO REGISTRO AGREGADO:", objeto)
      
    })
    .catch(err => {
      console.log(err.message)
    })
    
  }
 

  async function obtenSusTokens(docRef){
    console.log("La doc ref que tengo es:", docRef)

    var tokens

    await getDoc(docRef)
      .then(doc => {
        tokens = doc.data().tokens
        console.log("y tiene tantos tokens:", tokens)
        })
      return tokens 
  }

//Login con Google.
const googleLoginButton = document.querySelector('.googleLogin')
googleLoginButton.addEventListener('click', async (e) => {
  e.preventDefault()
  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider)
    .then(credenciales => {
      console.log('User logged in now...')
}).catch(err => {
      console.log(err.message)
    })
})

//Bring It
const puller = document.querySelector('.puller')
const textoPruebas = document.getElementById('textoPruebas');
puller.addEventListener('click', () => {
  glassCanvasB.style.display = 'block';
  console.log("Bring it on")
  textoPruebas.innerText = "Nuevo textual";
  glassCanvasB.classList.add('animate__fadeInRight');
  
})

// logging out
const logoutButton = document.querySelector('.logout')
logoutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      console.log('User signed out.')
    })
    .catch(err => {
      console.log(err.message)
    })
})

//Firestore
const db = getFirestore()

//init collection ref
const colRef = collection(db, 'users')

