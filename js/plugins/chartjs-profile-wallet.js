// JS (Chart.js v2 style) — replaces your original script
const profileWallet = document.getElementById("profileWallet");
if (profileWallet !== null) {
    // Each object = a selectable dataset pair (first = Market Size (USD, billions), second = Unit Shipments (Index))
    // 7 quarters are used so your existing layout/spacing remains unchanged.
    const profileWalletData = [
        // 1) Global Consumer Electronics (recommended default)
        {
            first: [1050, 1020, 1120, 1180, 1210, 1230, 1250],   // Market Size (USD, billions)
            second: [95, 90, 100, 105, 108, 110, 112]           // Unit Shipments (Index)
        },
        // 2) Global Smartphones (example alternative)
        {
            first: [520, 510, 540, 560, 570, 585, 600],
            second: [100, 98, 105, 110, 112, 115, 118]
        },
        // 3) Asia-Pacific Electronics (regional view)
        {
            first: [420, 400, 430, 455, 470, 485, 500],
            second: [88, 85, 91, 96, 99, 102, 105]
        },
        // 4) Europe Electronics (regional view)
        {
            first: [220, 215, 230, 240, 245, 250, 255],
            second: [72, 70, 75, 78, 80, 82, 84]
        }
    ];

    // Quarter labels (7 periods)
    const quarterLabels = [
        "Q3 2022",
        "Q4 2022",
        "Q1 2023",
        "Q2 2023",
        "Q3 2023",
        "Q4 2023",
        "Q1 2024"
    ];

    var config = {
        type: "line",
        data: {
            labels: quarterLabels,
            datasets: [
                {
                    // Primary dataset: Market Size
                    label: "Market Size (USD, billions)",
                    backgroundColor: "rgba(93, 120, 255, 0.9)",
                    borderColor: "transparent",
                    data: profileWalletData[0].first,
                    lineTension: 0,
                    pointRadius: 3,
                    borderWidth: 2,
                    fill: true,
                    pointHoverRadius: 5
                },
                {
                    // Secondary dataset: Unit Shipments (plotted on same axis but distinct style)
                    label: "Unit Shipments (Index)",
                    backgroundColor: "rgba(240, 243, 255, 1)",
                    borderColor: "transparent",
                    data: profileWalletData[0].second,
                    lineTension: 0,
                    borderWidth: 1,
                    pointRadius: 3,
                    fill: true,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: true,
                labels: {
                  boxWidth: 12,
                  fontColor: "#8a909d",
                  fontFamily: "Rubik, sans-serif"
                }
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false,
                        drawBorder: true,
                    },
                    ticks: {
                        fontColor: "#8a909d",
                        fontFamily: "Rubik, sans-serif",
                    },
                }],
                yAxes: [{
                    // Keep single shared axis for simplicity; units differ, but labels & tooltip clarify
                    gridLines: {
                        display: false,
                        color: "rgba(0,0,0,0.071)",
                        zeroLineColor: "rgba(0,0,0,0.071)"
                    },
                    ticks: {
                        // Show readable ticks; do not force stepSize if Chart.js chooses appropriate ticks
                        fontColor: "#8a909d",
                        fontFamily: "Rubik, sans-serif",
                        callback: function(value) {
                            // If values are large (market size), show as "$xxxB"; else show plain number for index
                            if (value >= 200) {
                                return "$" + value + "B";
                            }
                            return value;
                        }
                    }
                }]
            },
            tooltips: {
                mode: "index",
                intersect: false,
                titleFontColor: "#888",
                bodyFontColor: "#555",
                titleFontSize: 12,
                bodyFontSize: 13,
                backgroundColor: "rgba(255,255,255,0.95)",
                displayColors: true,
                xPadding: 10,
                yPadding: 7,
                borderColor: "rgba(220,220,220,0.9)",
                borderWidth: 1,
                caretSize: 6,
                caretPadding: 5,
                callbacks: {
                    // Make tooltip lines explicit about units
                    label: function(tooltipItem, data) {
                        const label = data.datasets[tooltipItem.datasetIndex].label || "";
                        const value = tooltipItem.yLabel;
                        if (label.includes("Market Size")) {
                            return label + ": $" + value + "B";
                        }
                        // Unit shipments
                        return label + ": " + value;
                    }
                }
            }
        }
    };

    const ctx = profileWallet.getContext("2d");
    const myLine = new Chart(ctx, config);

    // Keep existing toggle logic: make sure you have #area-chart-action span elements to click
    const items = document.querySelectorAll("#area-chart-action span");
    items.forEach(function (item, index) {
        item.addEventListener("click", function () {
            // Safeguard: if index out of range, ignore
            if (!profileWalletData[index]) return;

            config.data.labels = quarterLabels;
            config.data.datasets[0].data = profileWalletData[index].first;
            config.data.datasets[1].data = profileWalletData[index].second;

            // Update dataset labels to reflect which region/metric is selected (optional but helpful)
            const titles = [
                "Global Consumer Electronics",
                "Global Smartphones",
                "Asia-Pacific Electronics",
                "Europe Electronics"
            ];
            // update legend labels (Chart.js v2)
            config.data.datasets[0].label = "Market Size (USD, billions) — " + titles[index];
            config.data.datasets[1].label = "Unit Shipments (Index) — " + titles[index];

            myLine.update();
        });
    });
}
