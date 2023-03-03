import { useState, useEffect } from 'react'
import './admin.css'

import { auth, db } from '../../firebaseConnection'
import { signOut } from 'firebase/auth'

import { addDoc, collection, onSnapshot, query, orderBy, where, doc, deleteDoc, updateDoc} from 'firebase/firestore'

export default function Admin(){
  // Estado para a entrada de texto da tarefa
  const [tarefaInput, setTarefaInput] = useState('')
  // Estado para armazenar as informações do usuário
  const [user, setUser] = useState({})
  // Estado para armazenar a tarefa sendo editada
  const [edit, setEdit] = useState({})
  // Estado para armazenar a lista de tarefas
  const [tarefas, setTarefas] = useState([]);

  // useEffect para carregar as tarefas do usuário logado
  useEffect(() => {
    async function loadTarefas(){
      // Obtem os detalhes do usuário armazenados no localStorage
      const userDetail = localStorage.getItem("@detailUser")
      // Define o estado do usuário com os detalhes obtidos
      setUser(JSON.parse(userDetail))

      if(userDetail){
        const data = JSON.parse(userDetail);
        
        // Cria a referência para a coleção "tarefas" no Firestore
        const tarefaRef = collection(db, "tarefas")
        // Cria uma consulta para ordenar as tarefas por data de criação e filtrar pelo UID do usuário
        const q = query(tarefaRef, orderBy("created", "desc"), where("userUid", "==", data?.uid))

        // Registra um listener para receber atualizações em tempo real dos documentos retornados pela consulta
        const unsub = onSnapshot(q, (snapshot) => {
          let lista = [];

          // Itera sobre os documentos retornados pela consulta e adiciona suas informações em um array
          snapshot.forEach((doc)=> {
            lista.push({
              id: doc.id,
              tarefa: doc.data().tarefa,
              userUid: doc.data().userUid
            })
          })
          
          // Define o estado das tarefas com o array criado a partir dos documentos retornados pela consulta
          setTarefas(lista);
        })
      }
    }

    // Chama a função loadTarefas ao montar o componente
    loadTarefas();
  }, [])

  // Função para registrar uma nova tarefa ou atualizar uma tarefa existente
  async function handleRegister(e){
    e.preventDefault();

    // Verifica se o campo de entrada da tarefa está vazio e exibe um alerta caso esteja
    if(tarefaInput === ''){
      alert("Digite sua tarefa...")
      return;
    }

    // Verifica se uma tarefa está sendo editada e chama a função para atualizá-la
    if(edit?.id){
      handleUpdateTarefa();
      return;
    }

    // Adiciona uma nova tarefa ao Firestore com as informações fornecidas
    await addDoc(collection(db, "tarefas"), {
      tarefa: tarefaInput,
      created: new Date(),
      userUid: user?.uid
    })
    .then(() => {
      console.log("TAREFA REGISTRADA")
      // Limpa o campo de entrada da tarefa após a conclusão bem-sucedida
      setTarefaInput('')
    })
    .catch((error) => {
      console.log("ERRO AO REGISTRAR " + error)
    })


  }

 // Função para fazer logout do usuário atual
async function handleLogout(){
  await signOut(auth);
  }
  
  // Função para deletar uma tarefa do banco de dados
  async function deleteTarefa(id){
  const docRef = doc(db, "tarefas", id)
  await deleteDoc(docRef)
  }
  
  // Função para editar uma tarefa existente
  function editTarefa(item){
  setTarefaInput(item.tarefa)
  setEdit(item);
  }
  
  // Função para atualizar uma tarefa no banco de dados
  async function handleUpdateTarefa(){
  const docRef = doc(db, "tarefas", edit?.id)
  await updateDoc(docRef, {
  tarefa: tarefaInput
  })
  .then(() => {
  console.log("TAREFA ATUALIZADA")
  setTarefaInput('')
  setEdit({})
  })
  .catch(() => {
  console.log("ERRO AO ATUALIZAR")
  setTarefaInput('')
  setEdit({})
  })
  }
  
  // Renderização da página
  return(
    <div className="admin-container">
      <h1>Minhas tarefas</h1>

      {/* Formulário para registrar ou atualizar uma tarefa */}
      <form className="form" onSubmit={handleRegister}>
        <textarea
          placeholder="Digite sua tarefa..."
          value={tarefaInput}
          onChange={(e) => setTarefaInput(e.target.value) }
        />
        {/* // Botão para atualizar a tarefa, caso esteja em modo de edição, ou registrar uma nova tarefa */}
        {Object.keys(edit).length > 0 ? (
          <button className="btn-register" type="submit">Atualizar tarefa</button>
        ) : (
          <button className="btn-register" type="submit">Registrar tarefa</button>
        )}
      </form>

      {/* // Renderização de todas as tarefas registradas */}
      {tarefas.map((item) => (
      <article key={item.id} className="list">
        <p>{item.tarefa}</p>

        {/* Botões para editar ou concluir a tarefa */}
        <div>
          <button onClick={ () => editTarefa(item) }>Editar</button>
          <button onClick={ () => deleteTarefa(item.id) } className="btn-delete">Concluir</button>
        </div>
      </article>
      ))}

        {/* Botão para fazer logout */}
      <button className="btn-logout" onClick={handleLogout}>Sair</button>

    </div>
  )
}