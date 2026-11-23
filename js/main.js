
"use strict";

// ==========================================
// ECOBYTE - PERIÓDICO DIGITAL
// Funcionalidades principales
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================
    // 1. NAVEGACIÓN Y MENÚ
    // ======================================

    const menuToggle = document.querySelector(".menu-toggle");
    const navbarDropdown = document.querySelector(".nav-dropdown");

    function closeNavigationMenu() {
        if (!menuToggle || !navbarDropdown) return;

        navbarDropdown.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
    }

    function toggleNavigationMenu() {
        if (!menuToggle || !navbarDropdown) return;

        const isOpen = navbarDropdown.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Cerrar menú" : "Abrir menú"
        );
    }

    menuToggle?.addEventListener("click", toggleNavigationMenu);

    const navigationLinks = document.querySelectorAll(
        '.nav-dropdown a[href^="#"], .footer-links a[href^="#"], .hero-actions a[href^="#"]'
    );

    navigationLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (link.closest(".nav-dropdown")) {
                closeNavigationMenu();
            }
        });
    });

    document.addEventListener("click", event => {
        if (
            navbarDropdown &&
            menuToggle &&
            !navbarDropdown.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeNavigationMenu();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeNavigationMenu();
            menuToggle?.focus();
        }
    });


    // ======================================
    // 2. CALCULADORA DE IMPACTO AMBIENTAL
    // ======================================

    const phonesInput = document.getElementById("phones");
    const computersInput = document.getElementById("computers");
    const tabletsInput = document.getElementById("tablets");
    const reuseInput = document.getElementById("reuse");

    const calculateButton = document.getElementById("calculateButton");

    const reuseValue = document.getElementById("reuseValue");
    const totalWeight = document.getElementById("totalWeight");
    const reusableWeight = document.getElementById("reusableWeight");
    const calculatorMessage = document.getElementById("calculatorMessage");

    const deviceWeights = {
        phone: 0.2,
        computer: 2,
        tablet: 0.5
    };

    function getSafeQuantity(input) {
        if (!input) return 0;

        const value = Number(input.value);

        if (!Number.isFinite(value)) return 0;

        return Math.min(100, Math.max(0, Math.floor(value)));
    }

    function getSafePercentage(input) {
        if (!input) return 0;

        const value = Number(input.value);

        if (!Number.isFinite(value)) return 0;

        return Math.min(100, Math.max(0, value));
    }

    function updateReuseLabel() {
        if (!reuseValue || !reuseInput) return;

        reuseValue.textContent = `${getSafePercentage(reuseInput)}%`;
    }

    function calculateImpact() {
        const phones = getSafeQuantity(phonesInput);
        const computers = getSafeQuantity(computersInput);
        const tablets = getSafeQuantity(tabletsInput);

        const percentage = getSafePercentage(reuseInput);

        const total =
            phones * deviceWeights.phone +
            computers * deviceWeights.computer +
            tablets * deviceWeights.tablet;

        const reusable = total * (percentage / 100);

        // Actualizar los resultados
        if (totalWeight) {
            totalWeight.textContent = `${total.toFixed(2)} kg`;
        }

        if (reusableWeight) {
            reusableWeight.textContent = `${reusable.toFixed(2)} kg`;
        }

        updateReuseLabel();

        if (calculatorMessage) {

            if (total === 0) {
                calculatorMessage.textContent =
                    "Ingresa la cantidad de dispositivos para calcular su impacto.";

            } else {
                calculatorMessage.textContent =
                    `Tus dispositivos representan aproximadamente ${total.toFixed(2)} kg ` +
                    `de residuos electrónicos. Con una posibilidad de reutilización ` +
                    `del ${percentage}%, podrías aprovechar ${reusable.toFixed(2)} kg.`;
            }
        }
    }

    // Eventos del botón y campos
    calculateButton?.addEventListener("click", calculateImpact);

    [phonesInput, computersInput, tabletsInput].forEach(input => {
        input?.addEventListener("input", () => {
            // Limitar cantidades entre 0 y 100
            const value = Number(input.value);

            if (value < 0) input.value = 0;
            if (value > 100) input.value = 100;
        });
    });

    reuseInput?.addEventListener("input", updateReuseLabel);

    // Calcular resultados iniciales
    calculateImpact();


    // ======================================
    // 3. GRÁFICO INTERACTIVO: LA CIFRA DEL DÍA
    // ======================================

    const raeeChartCanvas = document.getElementById("raeeChart");
    const categoryFilter = document.getElementById("categoryFilter");
    const categoryInfo = document.getElementById("categoryInfo");

    const raeeCategories = [
        {
            id: "small",
            label: "Equipos pequeños",
            value: 127,
            description:
                "127 mil toneladas de equipos pequeños, como pequeños electrodomésticos."
        },
        {
            id: "temperature",
            label: "Intercambio de temperatura",
            value: 107,
            description:
                "107 mil toneladas de equipos de intercambio de temperatura, como neveras y aires acondicionados."
        },
        {
            id: "large",
            label: "Equipos grandes",
            value: 67,
            description:
                "67 mil toneladas de equipos grandes, como lavadoras y estufas."
        },
        {
            id: "screens",
            label: "Pantallas y monitores",
            value: 43,
            description:
                "43 mil toneladas de pantallas, televisores y monitores."
        },
        {
            id: "it",
            label: "Pequeños equipos informáticos",
            value: 32,
            description:
                "32 mil toneladas de pequeños equipos informáticos y de telecomunicaciones."
        },
        {
            id: "lamps",
            label: "Lámparas",
            value: 12,
            description:
                "12 mil toneladas de lámparas y equipos de iluminación."
        }
    ];

    let raeeChart = null;

    function updateRaeeChart() {

        if (!raeeChartCanvas) return;

        // Comprobar que Chart.js esté cargado
        if (typeof Chart === "undefined") {
            if (categoryInfo) {
                categoryInfo.textContent =
                    "No se pudo cargar el gráfico. Comprueba tu conexión a Internet.";
            }

            console.error("Chart.js no está disponible.");
            return;
        }

        const selectedCategory = categoryFilter?.value || "all";

        const filteredCategories = selectedCategory === "all"
            ? raeeCategories
            : raeeCategories.filter(
                category => category.id === selectedCategory
            );

        const labels = filteredCategories.map(
            category => category.label
        );

        const values = filteredCategories.map(
            category => category.value
        );

        // Destruir el gráfico anterior antes de crear uno nuevo
        if (raeeChart) {
            raeeChart.destroy();
        }

        raeeChart = new Chart(raeeChartCanvas, {
            type: "bar",

            data: {
                labels,

                datasets: [{
                    label: "Miles de toneladas",
                    data: values,

                    backgroundColor: "#174B35",
                    hoverBackgroundColor: "#C7E36A",

                    borderRadius: 8,
                    borderSkipped: false,

                    maxBarThickness: 75
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                animation: {
                    duration: 650
                },

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label: context => {
                                return `${context.parsed.y} mil toneladas`;
                            }
                        }
                    }
                },

                scales: {
                    x: {
                        grid: {
                            display: false
                        },

                        ticks: {
                            color: "#657168"
                        }
                    },

                    y: {
                        beginAtZero: true,

                        title: {
                            display: true,
                            text: "Miles de toneladas",
                            color: "#17271E"
                        },

                        ticks: {
                            color: "#68796D"
                        },

                        grid: {
                            color: "#E3E9DF"
                        }
                    }
                }
            }
        });

        // Actualizar descripción
        if (categoryInfo) {

            if (selectedCategory === "all") {
                categoryInfo.textContent =
                    "Se muestran las seis categorías de residuos electrónicos de Colombia.";
            } else if (filteredCategories.length > 0) {
                categoryInfo.textContent =
                    filteredCategories[0].description;
            } else {
                categoryInfo.textContent =
                    "No se encontraron datos para esta categoría.";
            }
        }
    }

    categoryFilter?.addEventListener("change", updateRaeeChart);

    // Crear el gráfico al cargar la página
    updateRaeeChart();


    // ======================================
    // 4. AÑO AUTOMÁTICO EN EL PIE DE PÁGINA
    // ======================================

    const footerYear = document.querySelector("[data-current-year]");

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }


    // ======================================
    // 5. REGISTRO DE CARGA
    // ======================================

    console.info("ECOBYTE: periódico digital cargado correctamente.");

});
