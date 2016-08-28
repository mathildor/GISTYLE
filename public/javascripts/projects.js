/**
 * Created by mathilde on 29/04/16.
 */
var project={
  activeProjects:[],
  activeDeleteProject:"",
  current:""
};

project.getProjectsForUserFromDB=function(){
    console.log("Collecting projects from db");
    $.ajax({ //gets all for specific user
        url:"projects",
        type:"get",
        dataType: "json",
        data:{},
        success: "success"

    }).complete(function(data){
        console.log('data');
        console.log(data);
        var projects=JSON.parse(data.responseText);
        //go through all layers and add them:
        for(var i=0; i<projects.length; i++){
            project.addNewProjectElement(projects[i].projectName);
            project.activeProjects.push(projects[i].projectName);
        }
        console.log(project.activeProjects.length);
        if(project.activeProjects.length<1){
            $('#noProjects').show();
        }else{
            $('#noProjects').hide();
        }
    });

}


project.openPopup=function(id, current){
    $("#overlay").show();
    $('#noProjects').hide();
    $("#"+id).show();
    project.activeDeleteProject=current; //to know what element caused the delete popup
}

project.closePopup = function (){
    $("#overlay").hide();
    $("#newProjectPopUp").hide();
    $("#deleteProjectPopUp").hide();

    if(project.activeProjects.length<1){
        $('#noProjects').show();
    }
}


project.new=function(){ //before named newProject
    document.getElementById("newProjectName").value="";
    project.openPopup("newProjectPopUp");
}

project.createNewProject=function(){
    // var projectName=document.getElementById("newProjectName").value;
    var projectName=project.getUnusedName(document.getElementById("newProjectName").value);
    project.activeProjects.push(projectName);
    project.current=projectName;
    project.addNewProjectElement(projectName);
    project.addToDB(projectName);
    project.closePopup();
    $('#noProjects').hide();

    project.addDefaultSublayers(projectName);
}

project.getUnusedName=function(name){
  var nameTaken=true;
  var count=1;
  var newName=name;
  while(nameTaken){
    console.log(project.activeProjects);
    if(common.exsistsInList(project.activeProjects, newName)){
      console.log("already in list, need to change to:");
      newName=name+"_"+count;
      count++;
      console.log(newName);
    }else{
      console.log("Name does not exist");
      console.log(newName);
      nameTaken=false;
      return newName;
    }
  }
}

project.addNewProjectElement=function(projectName){
    var link=document.createElement('a');
    link.className="projectLink";
    var div=document.createElement('div');
    div.className='col-md-2 projectDiv';
    // div.className='projectDiv';
    var deleteElement=document.createElement('h3');
    deleteElement.className="deleteProject";
    deleteElement.innerHTML="x";
    deleteElement.addEventListener('click', function(){
        project.openPopup('deleteProjectPopUp', event.currentTarget);
    });
    var elementDiv=document.createElement('div');
    elementDiv.className='projectElement';
    elementDiv.id=projectName;

    var img=document.createElement('img');
    img.className='projectImg';
    img.setAttribute('src', '../images/map.png');
    img.addEventListener('click', function () {
        project.current=event.currentTarget.innerHTML;
        window.location.href="#/mainPage";
    });
    var text=document.createElement('h5');
    text.innerHTML=projectName;

    //enter project event
    text.addEventListener('click',function(){
        project.current=event.currentTarget.innerHTML;
        window.location.href="#/mainPage";
    });

    elementDiv.appendChild(deleteElement);
    elementDiv.appendChild(img);
    elementDiv.appendChild(text);
    link.appendChild(elementDiv);
    div.appendChild(link);
    document.getElementById('projectsView').appendChild(div);
}

project.addToDB=function(projectName){
    $.post("/project",
        {
            projectName: projectName
        }
    ).complete(function(){
        console.log("completed");
    });
}

project.addDefaultSublayers=function(projectName){
    console.log('projectName:');
    console.log(projectName);
    $.ajax({ //get all default styling - saves them to layerStyling
        url:"defaultStyling",
        type:"post",
        dataType: "json",
        data:{
            projectName:projectName
        }
    }).complete(function(){
        console.log('copied default sublayers');
    });
}


project.delete=function(){ //named deleteProject before
    console.log('delete');
    var id=project.activeDeleteProject.parentElement.id;
    project.deleteProjectElement(id);
    project.deleteFromDB(id);

    console.log(project.activeProjects);
    console.log(project.activeProjects.length);

    //delete from active list:
    for(var i =0; i<project.activeProjects.length; i++){
      console.log('for loop');
      if(project.activeProjects[i]===id){
        project.activeProjects.splice(i, 1);
      }
    }
    //add text:no projects
    if(project.activeProjects.length<1){
      $('#noProjects').show();
    }
    project.closePopup();
}

project.deleteProjectElement=function(id){
    $("#"+id).parent().parent().remove();
}

project.deleteFromDB=function(projectName){

    console.log(projectName);
    console.log('delete project');
    $.ajax({ //gets all for specific user and project
        url:"deleteProject",
        type:"delete",
        dataType: "json",
        data:{
            projectName: projectName
        }
    }).complete(function(data){

    });
}
