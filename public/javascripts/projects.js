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
    openPopup("newProjectPopUp");
}

function createNewProject(){
    var projectName=document.getElementById("newProjectName").value;
    setProjectName(projectName);
    addNewProjectElement(projectName);
    addProjectToDB(projectName);
    closePopup();
    $('#noProjects').hide();
    addDefaultSublayers();
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
    var text=document.createElement('h4');
    text.innerHTML=projectName;

    link.setAttribute('href', "#/mainPage");
    link.addEventListener('click',function(){
        setProjectName(event.currentTarget.firstChild.id);
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

//adding default layers from default tabel, adds them to layerlist for user so user can change styling
function addDefaultSublayers(){

    $.ajax({
     url:"defaultLayers",
     type:"get",
     dataType: "json",
     data:{},
     success: "success"

     }).complete(function(data){
         var layers=JSON.parse(data.responseText);
         console.log(layers.length);
         //go through all layers and add them:
         for(var i=0; i<layers.length; i++){
         addNewSublayerFromDbLayer(layers[i], true, true);
         }
     });

}

function deleteProject(){
    console.log('delete');
    var id=activeDeleteProject.parentElement.id;
    deleteProjectElement(id);
    deleteProjectFromDB(id);

    //delete from active list:
    for(var i =0; activeProjects.length; i++){
        if(activeProjects[i]===id){
            activeProjects.splice(i, 1);
        }
    }
    closePopup();
}

function deleteProjectElement(id){
    $("#"+id).remove();
}

function deleteProjectFromDB(projectName){
    //TODO
}