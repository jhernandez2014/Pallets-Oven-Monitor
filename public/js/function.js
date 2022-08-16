// btn Value reference
$(document).on('click', '#btnRef', function(e){
  //var reference = {reference: $('#inputRef').val(), wet: $('#inputWet').val(),timeOut: $('#inputTimeOut').val(), sensor_error: $("#sensorError").val()};
 
  var modal = $(e.target).closest(".modal-content")[0]
  var inputs = modal.getElementsByTagName("input")
  var obj = {}
  for (index = 0; index < inputs.length; ++index) {
    // deal with inputs[index] element.
    const {name, value} = inputs[index]
    obj[name] = value
  }

  console.log(reference);
	 $.ajax({
        url : "/reference",
        type: "POST",
        data : obj,
        success: function(data)
        {
          //socket.emit('setReference', "update");         
          //alert("Guardado")
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
     
        }
    });
})

// A $( document ).ready() block.
$( document ).ready(function() {
  $('#dateReport').mask("0000-00-00");
  
  new IMask(
    document.getElementById("hourReport"), {
    mask: Number,
    min: 0,
    max: 23
  })  

});

function submitReport(){
  const id = $("#idReport").val()
  const date = $("#dateReport").val()
  const hour = $("#hourReport").val()

  if(id != "" && date != "" && hour !== ""){
    copyReport(id, date, hour)
  }else{
    alert("Faltan datos para realizar esta operación")
  }

}

function copyReport(id, date, hour){
  $.ajax({
    url: `/copy/report/${id}?date=${date}&hour=${hour}`,
    type: "GET",
    success: function(data){
      console.log("Success : ", data)
      window.location.href = "/dashboard"
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("errors:", jqXHR, textStatus, errorThrown)
    }
  })
}