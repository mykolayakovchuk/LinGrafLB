// первый объект 
var input1obj0 = {
    name: "red",
    axisNames: ["x","y"],
    dataInput: [[1,2],[2,2],[3,4],[4,3],[5,5],[6,1],[7,9],[8,3],[9,3]]
  };
var input1obj=[input1obj0];
var input1json=JSON.stringify(input1obj);
  
  //второй объект (по аналогии с первым объектом)
var input2obj0 = {
    name: "blue",
    axisNames: ["x","y"],
    dataInput: [[1,6],[2,7],[3,14],[4,9],[5,5],[6,19],[7,25],[8,17],[9,1]]
  };
 //два объекта предыдущих объекта объединены в один
var input2obj = [input1obj0, input2obj0];
var input2json=JSON.stringify(input2obj);
