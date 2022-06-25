live example of using you can find at
<h2><a href="http://nik-portf.ru/lingraflb/">http://nik-portf.ru/lingraflb/</h2>

# LinGrafLB
small Javascript library for buildig line charts using &lt;canvas>
This small JavaScript Library is for building line graphs from input data in JSON format (use <canvas> API). It is adaptive to browser width. And there is buttons to change scale and move line graph on coordinate grid. Example of input data, which was a source for building this graph you can find below (also see file inputForLinGraf.js). Coordinate grid is clickable, after click it will draw coordinates of click.

IMPORTANT:

1. This version of library works only with positive values. All values must be bigger than zero. And it not works correct with "Date"-format.

2. This version of library can draw no more than seven charts. If you need more -- add colors to massive of colors in line number 9 (LinGrafLB.js)S.

3. Input data must be ordered from smaller to bigger values for x-axis.

Instruction. (see example at exampleLinGraf.js).
1. create variable as class instance.

2. run function .runLinGraf of this instance with id of container as argument (id of container, where you want to charts be drawn).

Эта небольшая библиотека предназначена для построения линейных графиков. Исходные данные для построения -- объект в формате JSON. Отрисовка графиков адаптируется по ширине окна броузера. Построееные графики можно масштабировать и перемещать благодаря специальным кнопкам. Пример входящих данных приведён ниже (см. файл "inputForLinGraf.js"). Также пример входящих данных показан в консоли для этого примера. При щелчке в любой точке координатной сетки можно увидеть точные координаты.

ВАЖНЫЕ ОГРАНИЧЕНИЯ:

1. Графики корректно строятся только для положительных чисел (больше ноля).

2. Если вам нужно построить более семи графиков, то нужно расширить массив цветов (строка №9 файла LinGrafLB.js).

3. Для корректного построения данные должны быть предварительно упорядочены от меньшего к большему, для значений на горизонтальной оси. Пока эта функция не реализована.

Инструкция по эксплуатации. (образец использования см. в файле LinGraf.js).
1. Создаем переменную -- экземпляр класса.

2. Запускаем для этого экземпляра функцию первого запуска (имя_класса..runLinGraf("id контейнера")), где аргумент ("id контейнера") -- это указатель на контейнер, в котором требуется отрисовать графики.

ОБРАЗЕЦ ВХОДЯЩИХ ДАННЫХ. На основании него, построены графики ниже:

        {
        [
        {
          name: "red",
          axisNames: ["x","y"],
          dataInput: [[1,2],[2,2],[3,4],[4,3],[5,5],[6,1],[7,9],[8,3],[9,3]]
        },
        {
          name: "blue",
          axisNames: ["x","y"],
          dataInput: [[1,6],[2,7],[3,14],[4,9],[5,5],[6,19],[7,25],[8,17],[9,1]]
        }
        ]
        }  
      
