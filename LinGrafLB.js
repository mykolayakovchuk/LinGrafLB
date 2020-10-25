'use strict';

class LinGraf {
    constructor(inputData) {
        this.inputData = JSON.parse(inputData);
        this.browserWidth = document.body.clientWidth;
        this.scaleX;//автомасштабирование
        this.scaleY;
        this.grafColors=["red","green","blue", "purple", "black", "brown", "pink"]//цвета отрисовываемых линий
        this.heightGraphForConvertY;//после первого построения эти переменные заполняются значениями, которые определяют геометрические размеры генерируемого изображения
        this.widthGraphGlobal;
        this.zoomX=1;//глобальная переменная отвечающиая за масштабирование графика
        this.zoomY=1;
        this.offsetX=0;//глобальная переменная отвечающиая за прокрутку области просмотра грвфиков
        this.offsetY=0;
        }
    
    minmaxSearch(arrayData){
        var Minmax =new Object();
        Minmax.minX=arrayData[0]['dataInput'][0][0]; //заполняю значения первыми элементами массивов
        Minmax.maxX=arrayData[0]['dataInput'][0][0];
        Minmax.minY=arrayData[0]['dataInput'][0][1];
        Minmax.maxY=arrayData[0]['dataInput'][0][1];
//запуск функции сравнения значений и отбора наибольших и наименьших
        arrayData.forEach(function(itemFull, indexFull){
            itemFull['dataInput'].forEach(function(item, index){
                    if (item[0]<=Minmax.minX){
                        Minmax.minX=item[0];
                    }else if(item[0]>=Minmax.maxX){
                        Minmax.maxX=item[0];
                    }
//!!тут два раздельных цикла иф елс   
                    if(item[1]<=Minmax.minY){
                        Minmax.minY=item[1];
                    }else if(item[1]>=Minmax.maxY){
                        Minmax.maxY=item[1];
                    }
            });
        });
        return Minmax;//возвращаем объект с минимальными и максимальными значениями входящих данных
    }

    calculateCounter(scale){ // это счетчик. Он следит чтобы сетка координатных осей была с шагом не менее 50 пикселей
        var counter=0;
        if (scale>=50){ counter=1;
        }else{
            do {
                counter=counter+1;
              } while (counter*scale <= 50); 
        }
        return counter;
    }

    runLinGraf(aimID){ // первый запуск. Построение сетки, графика и слушателей событий для изменения внешнего вида.
        this.createCanvasContainer(aimID);
        this.createGraphLegend(aimID);
        this.createGraphButtons(aimID);
        this.drawGrid(aimID);
        this.drawGraph(aimID);
        this.addListener(aimID);
    }

    createCanvasContainer(aimID){ //формирование и вставка нового элемента canvas
        var widthGraph=Math.floor(this.browserWidth*0.7);//ширина(высота) нового элемента
        var heightGraph=Math.floor((widthGraph*2)/3);
        //формирование и вставка нового элемента canvas
        var canvasBase="<canvas id=\'"+aimID+"Graph\' width=\'"+widthGraph+"\' height=\'"+heightGraph+"\'></canvas>";
        document.getElementById(aimID).innerHTML=canvasBase;
    }
    
    createGraphLegend(aimID){//формирование и вставка нового элемента canvas(легенда графиков)
        let widthGraphLegend=Math.floor(this.browserWidth*0.7);//ширина(высота) нового элемента
        let heightGraphLegend=(this.inputData.length*50)+25; // по пятьдесят пикселей на каждую линию
        let canvasLegend = document.createElement("canvas");
        var grafColors=this.grafColors;
        canvasLegend.setAttribute("id", aimID+"GraphLegend");
        canvasLegend.setAttribute("width", widthGraphLegend);
        canvasLegend.setAttribute("height", heightGraphLegend);
        document.getElementById(aimID).appendChild(canvasLegend);
        var ctx = document.getElementById(aimID+"GraphLegend").getContext("2d");
        ctx.save();
        ctx.fillStyle = "Black";
        ctx.translate(25, 0);
        ctx.font = "18px serif";
        ctx.lineWidth = 2.5;
        this.inputData.forEach(function(itemFull, indexFull) {
            ctx.translate(0, 30);
            ctx.strokeStyle=grafColors[indexFull];
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(300, 0);
            ctx.stroke();
            ctx.fillText(itemFull['name'], 330, 8);
        });
        ctx.restore();
    }

    createGraphButtons(aimID){//формирование и вставка кнопок управления просмотром графиков
        var buttonsContainerID=aimID+"Buttons";
        var buttonsContainer = document.createElement("div");
        var buttonsList=new Object();
        buttonsList.ID = ["MoveUp","MoveDown","MoveLeft","MoveRight","ZoomXplus","ZoomXminus","ZoomYplus","ZoomYminus","Refresh"];
        buttonsList.lettering = ["↑","↓","←","→","ZoomX+","ZoomX-","ZoomY+","ZoomY-","↻"];//тут юникод. обычные html значения не берёт
        buttonsContainer.setAttribute("id", buttonsContainerID);
        buttonsContainer.style.cssText = "margin-left: 150px";
        document.getElementById(aimID).insertBefore(buttonsContainer, document.getElementById(aimID+"Graph"));
        for(let i=0; i<buttonsList.ID.length; i++){
            let button = document.createElement("button");
            button.setAttribute("id", buttonsContainerID+buttonsList.ID[i]);
            button.setAttribute("type", "button");
            button.style.cssText = "margin-left: 15px";
            button.textContent=buttonsList.lettering[i];
            document.getElementById(aimID+"Buttons").appendChild(button);
        }
    }

    drawGrid(aimID){ // прорисовка координатной сетки
        var widthGraph=Math.floor(this.browserWidth*0.7);//ширина(высота) нового элемента
        var heightGraph=Math.floor((widthGraph*2)/3);
        //формирование и вставка нового элемента canvas
        var Minmax = this.minmaxSearch(this.inputData); //вычисляю минимальные и максимальные значения, результат пишу в объект
        this.scaleX=Math.floor((widthGraph-200)/(Minmax.maxX-Minmax.minX));
        this.scaleY=Math.floor((heightGraph-200)/(Minmax.maxY-Minmax.minY));
        //при округлении выше образуется остаток поэтому в строках ниже мы отбрасываем его, переопределяя widthGraph  heightGraph
        widthGraph=widthGraph-((widthGraph-200)-(this.scaleX*(Minmax.maxX-Minmax.minX)));
        heightGraph=heightGraph-((heightGraph-200)-(this.scaleY*(Minmax.maxY-Minmax.minY)));
        var ctx = document.getElementById(aimID+"Graph").getContext("2d");
        ctx.save();
        ctx.translate(150, 50);
        ctx.fillStyle = "PapayaWhip";
        ctx.fillRect (0, 0, (widthGraph-200), (heightGraph-200));
        ctx.strokeStyle="Grey";
        ctx.font = "18px serif";
        ctx.fillStyle = "Black";
        //вычисляем, сколько значений в диапазоне требуется пропустить, дабы ячейка сетки не была меннее 50 пикселей
        var counterX=this.calculateCounter(this.scaleX*this.zoomX);
        var counterY=this.calculateCounter(this.scaleY*this.zoomY);
        for (var i = 0-this.offsetX; i<=(widthGraph-200)-this.offsetX; i=i+(this.scaleX*this.zoomX*counterX)){ //абсциссы
            ctx.beginPath();
            ctx.moveTo(i+this.offsetX,(heightGraph-200));
            ctx.lineTo(i+this.offsetX, 0);
            ctx.stroke();
            let xValue=Minmax.minX+(i/(this.scaleX*this.zoomX))
            ctx.fillText((Math.floor(xValue * 100) / 100), i+this.offsetX, (heightGraph-170));
           }
        for (var i = 0-this.offsetY; i<=(heightGraph-200)-this.offsetY; i=i+(this.scaleY*this.zoomY*counterY)){ //ординаты
            ctx.beginPath();
            ctx.moveTo((widthGraph-200),i+this.offsetY);
            ctx.lineTo(0, i+this.offsetY);
            ctx.stroke();
            let yValue=(Minmax.maxY-Minmax.minY)/this.zoomY+Minmax.minY-(i/(this.scaleY*this.zoomY));
            ctx.fillText((Math.floor(yValue * 100) / 100), -50, i+9+this.offsetY);
           }
        ctx.fillText(this.inputData[0].axisNames[0], (widthGraph-200), (heightGraph-140));
        ctx.fillText(this.inputData[0].axisNames[1], -50, -30);
        ctx.restore();
        this.heightGraphForConvertY=heightGraph; //возвращаем вычисленную высоту  и ширину для использования в функции отрисовки графика.
        this.widthGraphGlobal=widthGraph;
    }
        

    drawGraph(aimID){
        var Minmax = this.minmaxSearch(this.inputData); //вычисляю минимальные и максимальные значения, результат пишу в объект
        var heightY=this.heightGraphForConvertY-200;
        var grafColors=this.grafColors;
        var scaleX =this.scaleX;
        var scaleY =this.scaleY;
        var zoomX=this.zoomX;
        var zoomY=this.zoomY;
        var offsetX=this.offsetX;
        var offsetY=this.offsetY;
        var ctx = document.getElementById(aimID+"Graph").getContext("2d");
        ctx.save();
        ctx.translate(150, 50);
        ctx. rect(-1,-1, this.widthGraphGlobal-197, heightY+1);//обрезаем линии, которые выходят за область графика
        ctx.clip();
        ctx.lineWidth = 2.5;
        this.inputData.forEach(function(itemFull, indexFull) {
            ctx.strokeStyle=grafColors[indexFull];
            for (var i =0; i<(itemFull['dataInput'].length-1); i++){ // рисуем линии из точки (x0, y0) до точки (x1, y1)
                ctx.beginPath();
                let x0=itemFull['dataInput'][i][0]*scaleX*zoomX-(scaleX*zoomX*Minmax.minX);
                let x1=itemFull['dataInput'][i+1][0]*scaleX*zoomX-(scaleX*zoomX*Minmax.minX);
                let y0=itemFull['dataInput'][i][1]*scaleY*zoomY-(scaleY*zoomY*Minmax.minY);
                let y1=itemFull['dataInput'][i+1][1]*scaleY*zoomY-(scaleY*zoomY*Minmax.minY);
                ctx.moveTo(x0+offsetX,heightY-y0+offsetY);
                ctx.lineTo(x1+offsetX,heightY-y1+offsetY);
                ctx.stroke();
            }
          });
        ctx.restore();
    }
    
    addListener(aimID){
    document.getElementById(aimID+"Graph").addEventListener('mouseup', this.drawPointOnGraph.bind(this)); //функция отрисовки выбранной точки (Все данные берёт из элемента события)
    /// функция выше через bind привязана к имени экземпляра класса (this для листенеров по умолчанию привязывется к объекту события,
    //поэтому this нужно переопределить подобно this в других функциях данного класса)
    document.getElementById(aimID+"Buttons"+"MoveUp").addEventListener('mouseup', this.offsetYup.bind(this));//функции управлением смещений 
    document.getElementById(aimID+"Buttons"+"MoveDown").addEventListener('mouseup', this.offsetYdown.bind(this));//области просмотра
    document.getElementById(aimID+"Buttons"+"MoveLeft").addEventListener('mouseup', this.offsetXleft.bind(this));
    document.getElementById(aimID+"Buttons"+"MoveRight").addEventListener('mouseup', this.offsetXright.bind(this));
    document.getElementById(aimID+"Buttons"+"ZoomXplus").addEventListener('mouseup', this.zoomXplus.bind(this));//функции управления масштабом
    document.getElementById(aimID+"Buttons"+"ZoomXminus").addEventListener('mouseup', this.zoomXminus.bind(this));//отображения
    document.getElementById(aimID+"Buttons"+"ZoomYplus").addEventListener('mouseup', this.zoomYplus.bind(this));
    document.getElementById(aimID+"Buttons"+"ZoomYminus").addEventListener('mouseup', this.zoomYminus.bind(this));
    document.getElementById(aimID+"Buttons").addEventListener('mouseup', this.buttonsFreezer.bind(this));//проверка, которая ограничивает 
    //величины смещений графика и уменьшения масштабирования
    document.getElementById(aimID+"Buttons"+"Refresh").addEventListener('mouseup', this.refreshGraph.bind(this));//возвращение 
                                                                                                                //настроек по умолчанию
    }
    
    drawPointOnGraph(e) {//где е -- объект возвращаемый слушателем события//функция отрисовки выбранной точки (Все данные берёт из элемента события). //По типу анимации "по щелчку".
        var Minmax = this.minmaxSearch(this.inputData); //вычисляю минимальные и максимальные значения, результат пишу в объект
        var ctx = document.getElementById(e.srcElement.id).getContext("2d");
        var scaleX = this.scaleX;
        var scaleY = this.scaleY;
        var zoomX = this.zoomX;
        var zoomY = this.zoomY;
        var offsetX = this.offsetX;
        var offsetY = this.offsetY;
        var heightY = this.heightGraphForConvertY-200;
        var widthGraphGlobal = this.widthGraphGlobal
        var currentClickXValue0Index=0; // это переменная под значение на оси Х ближайшее слева от "щелчка" мыши.
        var deltaYValue;
        ctx.clearRect(0,0, e.srcElement.width, e.srcElement.height);
        this.drawGrid(e.path[0].parentElement.id);
        this.drawGraph(e.path[0].parentElement.id);
        ctx.save();
        ctx.translate(150, 50);
        var x = e.pageX - document.getElementById(e.srcElement.id).offsetLeft-150;
        var y = e.pageY - document.getElementById(e.srcElement.id).offsetTop-50;
        if (x>0 && y>0 && x<(e.srcElement.width-200)){ //условие чтобы клик произошёл именно в области графика       
            //рисуем вертикальную линию
            ctx.strokeStyle="Grey";
            ctx.font = "18px serif";
            ctx.fillStyle = "Black";
            ctx.beginPath();
            ctx.setLineDash([4, 8]);
            ctx.moveTo(x,(this.heightGraphForConvertY-200));
            ctx.lineTo(x, 0);
            ctx.stroke();
            ctx.fillText((Minmax.minX+((x-offsetX)/(this.scaleX*zoomX))).toFixed(3), x, (this.heightGraphForConvertY-150));
            this.inputData.forEach(function(itemFull, indexFull) {
                let lastElementIndex=itemFull['dataInput'].length-1; // проверка. если щелчок произошёл за областью графика, не отрисовываем горизонтальные линии (иначе будет bug)
                let firstElementIndex=0;
                let selectedXPoint=Minmax.minX+((x-offsetX)/(scaleX*zoomX));
                if (selectedXPoint<itemFull['dataInput'][firstElementIndex][0] || selectedXPoint>itemFull['dataInput'][lastElementIndex][0]){
                    return;
                }
                // поиск значения X (индекса элемента), ближайшего, справа от которого произошел "щелчок" мыши
                itemFull['dataInput'].forEach(function(item, index, array){
                    if (array[index][0]<=(Minmax.minX+((x-offsetX)/(scaleX*zoomX))) && array[index+1][0]>=(Minmax.minX+((x-offsetX)/(scaleX*zoomX)))){
                        currentClickXValue0Index=index;
                    }
                });//
                let y0=itemFull['dataInput'][currentClickXValue0Index][1];//значения у с обеих сторон от клика мыши
                let y1=itemFull['dataInput'][currentClickXValue0Index+1][1];
                let x0=itemFull['dataInput'][currentClickXValue0Index][0];
                let x1=itemFull['dataInput'][currentClickXValue0Index+1][0];
                ctx. rect(-150,-1, widthGraphGlobal, heightY+1);//обрезаем линии, которые выходят за область графика
                ctx.clip();
                if (y0 == y1){ // график может быть y=const || ниспадающим || возрастающим || undefined
                    ctx.beginPath();
                    ctx.moveTo(0,(heightY+offsetY-(y0-Minmax.minY)*scaleY*zoomY));
                    ctx.lineTo(x, (heightY+offsetY-(y0-Minmax.minY)*scaleY*zoomY));
                    ctx.stroke();
                    ctx.fillText(y0, -100, (heightY+offsetY-(y0-Minmax.minY)*scaleY*zoomY)+9);  
                }else if(y0 < y1){
                    ctx.beginPath();
                    deltaYValue=((Minmax.minX+((x-offsetX)/(scaleX*zoomX))-x0)/(x1-x0))*(y1-y0);
                    ctx.moveTo(0, (heightY+offsetY-(y0-Minmax.minY)*scaleY*zoomY)-deltaYValue*scaleY*zoomY);
                    ctx.lineTo(x, (heightY+offsetY-(y0-Minmax.minY)*scaleY*zoomY)-deltaYValue*scaleY*zoomY);
                    ctx.stroke();
                    ctx.fillText((y0+deltaYValue).toFixed(3), -100, (heightY+offsetY-(y0+deltaYValue-Minmax.minY)*scaleY*zoomY)+9);  
                }else if(y0 > y1){
                    ctx.beginPath();
                    deltaYValue=((Minmax.minX+((x-offsetX)/(scaleX*zoomX))-x0)/(x1-x0))*(y0-y1);
                    ctx.moveTo(0,(heightY+offsetY-(y0-Minmax.minY)*scaleY*zoomY)+deltaYValue*scaleY*zoomY);
                    ctx.lineTo(x, (heightY+offsetY-(y0-Minmax.minY)*scaleY*zoomY)+deltaYValue*scaleY*zoomY);
                    ctx.stroke(); 
                    ctx.fillText((y0-deltaYValue).toFixed(3), -100, (heightY+offsetY-(y0-deltaYValue-Minmax.minY)*scaleY*zoomY)+9);  
                }
            });    
        }
        ctx.restore();           
    }

    offsetYup(e){
        this.offsetY=this.offsetY-((this.scaleY*this.zoomY)/2); // меняем глобальную переменную по смещению графика
        var GraphContainer=e.path[2].id+"Graph";//находим элемент, в котором отрисован график
        var ctx = document.getElementById(GraphContainer).getContext("2d");
        ctx.clearRect(0,0, e.path[2].children[1].clientWidth, e.path[2].children[1].clientHeight);//очищаем область графика
        this.drawGrid(e.path[2].id);
        this.drawGraph(e.path[2].id); 
    }

    offsetYdown(e){
        this.offsetY=this.offsetY+((this.scaleY*this.zoomY)/2); // меняем глобальную переменную по смещению графика
        var GraphContainer=e.path[2].id+"Graph";//находим элемент, в котором отрисован график
        var ctx = document.getElementById(GraphContainer).getContext("2d");
        ctx.clearRect(0,0, e.path[2].children[1].clientWidth, e.path[2].children[1].clientHeight);//очищаем область графика
        this.drawGrid(e.path[2].id);
        this.drawGraph(e.path[2].id); 
    }

    offsetXleft(e){
        this.offsetX=this.offsetX-((this.scaleX*this.zoomX)/4); // меняем глобальную переменную по смещению графика
        var GraphContainer=e.path[2].id+"Graph";//находим элемент, в котором отрисован график
        var ctx = document.getElementById(GraphContainer).getContext("2d");
        ctx.clearRect(0,0, e.path[2].children[1].clientWidth, e.path[2].children[1].clientHeight);//очищаем область графика
        this.drawGrid(e.path[2].id);
        this.drawGraph(e.path[2].id); 
    }

    offsetXright(e){
        this.offsetX=this.offsetX+((this.scaleX*this.zoomX)/4); // меняем глобальную переменную по смещению графика
        var GraphContainer=e.path[2].id+"Graph";//находим элемент, в котором отрисован график
        var ctx = document.getElementById(GraphContainer).getContext("2d");
        ctx.clearRect(0,0, e.path[2].children[1].clientWidth, e.path[2].children[1].clientHeight);//очищаем область графика
        this.drawGrid(e.path[2].id);
        this.drawGraph(e.path[2].id); 
    }

    zoomXplus(e){//масштабирование по оси X
        if(this.zoomX>1){
            this.zoomX=this.zoomX+0.25;
        }else{
            this.zoomX=this.zoomX+0.1;            
        }
        var GraphContainer=e.path[2].id+"Graph";//находим элемент, в котором отрисован график
        var ctx = document.getElementById(GraphContainer).getContext("2d");
        ctx.clearRect(0,0, e.path[2].children[1].clientWidth, e.path[2].children[1].clientHeight);//очищаем область графика
        this.drawGrid(e.path[2].id);
        this.drawGraph(e.path[2].id); 
    }

    zoomXminus(e){
        if(this.zoomX>1){
            this.zoomX=this.zoomX-0.25;
        }else{
            this.zoomX=this.zoomX-0.1;            
        }
        var GraphContainer=e.path[2].id+"Graph";//находим элемент, в котором отрисован график
        var ctx = document.getElementById(GraphContainer).getContext("2d");
        ctx.clearRect(0,0, e.path[2].children[1].clientWidth, e.path[2].children[1].clientHeight);//очищаем область графика
        this.drawGrid(e.path[2].id);
        this.drawGraph(e.path[2].id); 
    }

    zoomYplus(e){//масштабирование по оси Y
        if(this.zoomY>1){
            this.zoomY=this.zoomY+0.25;
        }else{
            this.zoomY=this.zoomY+0.1;
        }
        var GraphContainer=e.path[2].id+"Graph";//находим элемент, в котором отрисован график
        var ctx = document.getElementById(GraphContainer).getContext("2d");
        ctx.clearRect(0,0, e.path[2].children[1].clientWidth, e.path[2].children[1].clientHeight);//очищаем область графика
        this.drawGrid(e.path[2].id);
        this.drawGraph(e.path[2].id); 
    }

    zoomYminus(e){
        if(this.zoomY>1){
            this.zoomY=this.zoomY-0.25;
        }else{
            this.zoomY=this.zoomY-0.1;            
        }
        var GraphContainer=e.path[2].id+"Graph";//находим элемент, в котором отрисован график
        var ctx = document.getElementById(GraphContainer).getContext("2d");
        ctx.clearRect(0,0, e.path[2].children[1].clientWidth, e.path[2].children[1].clientHeight);//очищаем область графика
        this.drawGrid(e.path[2].id);
        this.drawGraph(e.path[2].id); 
    }

    buttonsFreezer(e){//проверка которая ограничивает область прокрутки
        //проверка которая ограничивает область прокрутки вверх offsetYup
        if (this.offsetY < this.heightGraphForConvertY*this.zoomY*(-1)){ 
            document.getElementById(e.path[1].children[0].id).setAttribute("disabled", "disabled");
        }else{
            document.getElementById(e.path[1].children[0].id).removeAttribute("disabled");  
        }
        //проверка которая ограничивает область прокрутки вниз offsetYdown
        if (this.offsetY > this.heightGraphForConvertY*this.zoomY){ 
            document.getElementById(e.path[1].children[1].id).setAttribute("disabled", "disabled");
        }else{
            document.getElementById(e.path[1].children[1].id).removeAttribute("disabled");  
        }
         //проверка которая ограничивает область прокрутки влево offsetXleft
         if (this.offsetX < this.widthGraphGlobal*this.zoomX*(-1)){ 
            document.getElementById(e.path[1].children[2].id).setAttribute("disabled", "disabled");
        }else{
            document.getElementById(e.path[1].children[2].id).removeAttribute("disabled");  
        }
        //проверка которая ограничивает область прокрутки вправо offsetXright
        if (this.offsetX > this.widthGraphGlobal*this.zoomX){ 
            document.getElementById(e.path[1].children[3].id).setAttribute("disabled", "disabled");
        }else{
            document.getElementById(e.path[1].children[3].id).removeAttribute("disabled");  
        }
        //проверка которая не даёт стать отрицательным числом переменной, которая отвечает за масштабирование
        if (this.zoomX > 10){ 
            document.getElementById(e.path[1].children[4].id).setAttribute("disabled", "disabled");
        }else{
            document.getElementById(e.path[1].children[4].id).removeAttribute("disabled");  
        }
        if (this.zoomX < 0.2){ 
            document.getElementById(e.path[1].children[5].id).setAttribute("disabled", "disabled");
        }else{
            document.getElementById(e.path[1].children[5].id).removeAttribute("disabled");  
        }
        if (this.zoomY > 10){ 
            document.getElementById(e.path[1].children[6].id).setAttribute("disabled", "disabled");
        }else{
            document.getElementById(e.path[1].children[6].id).removeAttribute("disabled");  
        }
        if (this.zoomY < 0.2){ 
            document.getElementById(e.path[1].children[7].id).setAttribute("disabled", "disabled");
        }else{
            document.getElementById(e.path[1].children[7].id).removeAttribute("disabled");  
        }                    
    }

    refreshGraph(e){
        this.zoomX=1;//глобальная переменная отвечающиая за масштабирование графика
        this.zoomY=1;
        this.offsetX=0;//глобальная переменная отвечающиая за прокрутку области просмотра грвфиков
        this.offsetY=0;
        var GraphContainer=e.path[2].id+"Graph";//находим элемент, в котором отрисован график
        var ctx = document.getElementById(GraphContainer).getContext("2d");
        ctx.clearRect(0,0, e.path[2].children[1].clientWidth, e.path[2].children[1].clientHeight);//очищаем область графика
        this.drawGrid(e.path[2].id);
        this.drawGraph(e.path[2].id);
    }

    showData(){
        console.log (this.inputData);
    }

}