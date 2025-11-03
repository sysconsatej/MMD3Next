const LineLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
];

const pieLabels = ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"];

export const allChartData = {
  line: {
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Chart.js Line Chart",
        },
      },
    },
    data: {
      labels: LineLabels,
      datasets: [
        {
          fill: true,
          label: "Dataset 1",
          data: [65, 59, 80, 81, 56, 155, 140],
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    },
  },

  area: {
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Chart.js Line Chart",
        },
      },
    },
    data: {
      labels: LineLabels,
      datasets: [
        {
          fill: true,
          label: "Dataset 1",
          data: [65, 59, 80, 81, 56, 55, 140],
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    },
  },

  bar: {
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Chart.js Bar Chart",
        },
      },
    },
    data: {
      labels: LineLabels,
      datasets: [
        {
          label: "Dataset 1",
          data: [65, 59, 80, 81, 56, 55, 140],
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    },
  },

  pie: {
    data: {
      lables: pieLabels,
      datasets: [
        {
          label: "# of Votes",
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },



    
  },



   dounut: {
    data: {
      lables: pieLabels,
      datasets: [
        {
          label: "# of Votes",
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },



    
  },
};
