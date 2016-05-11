/**
 * Created by mathilde on 29/04/16.
 */

var activeDeleteProject;
var activeProjects= [];

function getProjectsForUserFromDB(){

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
            addNewProjectElement(projects[i].projectName);
            activeProjects.push(projects[i].projectName);
        }
        console.log(activeProjects.length);
        if(activeProjects.length<1){
            $('#noProjects').show();
        }else{
            $('#noProjects').hide();
        }
    });

}


function openPopup(id, current){
    $("#overlay").show();
    $('#noProjects').hide();
    $("#"+id).show();
    activeDeleteProject=current; //to know what element caused the delete popup
}

function closePopup(){
    $("#overlay").hide();
    $("#newProjectPopUp").hide();
    $("#deleteProjectPopUp").hide();

    if(activeProjects.length<1){
        $('#noProjects').show();
    }
}


function newProject(){
    document.getElementById("newProjectName").value="";
    openPopup("newProjectPopUp");
}

function createNewProject(){
    var projectName=document.getElementById("newProjectName").value;
    setProjectName(projectName);
    addNewProjectElement(projectName);
    addProjectToDB(projectName);
    closePopup();
    $('#noProjects').hide();

    addDefaultSublayers(projectName);
}

function addNewProjectElement(projectName){
    var link=document.createElement('a');
    link.className="projectLink";
    var div=document.createElement('div');
    div.className='col-md-2 projectDiv';
    var deleteElement=document.createElement('h3');
    deleteElement.className="deleteProject";
    deleteElement.innerHTML="x";
    deleteElement.addEventListener('click', function(){
        openPopup('deleteProjectPopUp', event.currentTarget);
    });
    var elementDiv=document.createElement('div');
    elementDiv.className='projectElement';
    elementDiv.id=projectName;


    var img=document.createElement('img');
    img.className='projectImg';
    img.setAttribute('src', '../images/map.png');
    var text=document.createElement('h5');
    text.innerHTML=projectName;

    //enter project event
    text.addEventListener('click',function(){
        setProjectName(event.currentTarget.innerHTML);
            //when click was on whole area: setProjectName(event.currentTarget.firstChild.id);
            //happens in init map!
            //enterProject(event.currentTarget.firstChild.id);
        window.location.href="#/mainPage";
    });

    elementDiv.appendChild(deleteElement);
    elementDiv.appendChild(img);
    elementDiv.appendChild(text);
    link.appendChild(elementDiv);
    div.appendChild(link);
    document.getElementById('projectsView').appendChild(div);
}


function addProjectToDB(projectName){
    $.post("/project",
        {
            projectName: projectName
        }
    ).complete(function(){
        console.log("completed");
    });


}


function addDefaultSublayers(projectName){
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


function deleteProject(){
    console.log('delete');
    var id=activeDeleteProject.parentElement.id;
    deleteProjectElement(id);
    deleteProjectFromDB(id);

    console.log(activeProjects);
    console.log(activeProjects.length);

    //delete from active list:
    for(var i =0; i<activeProjects.length; i++){
        console.log('for loop');
        if(activeProjects[i]===id){
            activeProjects.splice(i, 1);
        }
    }
    closePopup();
}

function deleteProjectElement(id){
    $("#"+id).parent().parent().remove();
}

function deleteProjectFromDB(projectName){

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