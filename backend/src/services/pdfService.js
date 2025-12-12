const PDFDocument = require("pdfkit");
const moment = require("moment");


const generateTrajetPDF = (trajet) => {
  return new Promise((resolve, reject) => {
    try {
      // Créer un nouveau document PDF
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `Trajet ${trajet._id}`,
          Author: "Fleet Management System",
          Subject: "Rapport de trajet",
          Keywords: "trajet, transport, fleet",
        },
      });

      // Buffer pour stocker le PDF
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // --- EN-TÊTE ---
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .fillColor("#2c3e50")
        .text("FLEET MANAGEMENT", { align: "center" });

      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#7f8c8d")
        .text("Rapport de Trajet", { align: "center" });

      doc.moveDown(0.5);
      doc
        .strokeColor("#3498db")
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(1.5);

      // --- INFORMATIONS GÉNÉRALES ---
      addSection(doc, "INFORMATIONS GÉNÉRALES");

      addInfoLine(doc, "ID Trajet", trajet._id.toString());
      addInfoLine(doc, "Statut", formatStatut(trajet.statut));
      addInfoLine(
        doc,
        "Date de création",
        moment(trajet.createdAt).format("DD/MM/YYYY à HH:mm")
      );

      doc.moveDown(1);

      // --- CHAUFFEUR ---
      addSection(doc, "CHAUFFEUR");

      if (trajet.chauffeur) {
        addInfoLine(doc, "Nom", trajet.chauffeur.name || "N/A");
        addInfoLine(doc, "Email", trajet.chauffeur.email || "N/A");
      } else {
        addInfoLine(doc, "Chauffeur", "Non assigné");
      }

      doc.moveDown(1);

      // --- VÉHICULES ---
      addSection(doc, "VÉHICULES");

      // Camion
      if (trajet.camion) {
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("#34495e")
          .text("Camion :");

        addInfoLine(doc, "  Matricule", trajet.camion.matricule);
        addInfoLine(
          doc,
          "  Marque/Modèle",
          `${trajet.camion.marque} ${trajet.camion.modele}`
        );
        addInfoLine(doc, "  Capacité", `${trajet.camion.capaciteCharge} kg`);
      } else {
        addInfoLine(doc, "Camion", "Non assigné");
      }

      doc.moveDown(0.5);

      // Remorque
      if (trajet.remorque) {
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("#34495e")
          .text("Remorque :");

        addInfoLine(doc, "  Matricule", trajet.remorque.matricule);
        addInfoLine(
          doc,
          "  Marque/Modèle",
          `${trajet.remorque.marque} ${trajet.remorque.modele}`
        );
        addInfoLine(doc, "  Type", trajet.remorque.type || "N/A");
      } else {
        addInfoLine(doc, "Remorque", "Non assignée");
      }

      doc.moveDown(1);

      // --- ITINÉRAIRE ---
      addSection(doc, "ITINÉRAIRE");

      addInfoLine(doc, "Lieu de départ", trajet.lieuDepart);
      addInfoLine(doc, "Lieu d'arrivée", trajet.lieuArrivee);

      if (trajet.distancePrevue) {
        addInfoLine(doc, "Distance prévue", `${trajet.distancePrevue} km`);
      }

      doc.moveDown(1);

      // --- DATES ET HORAIRES ---
      addSection(doc, "DATES ET HORAIRES");

      addInfoLine(
        doc,
        "Départ prévu",
        moment(trajet.dateDepart).format("DD/MM/YYYY à HH:mm")
      );

      if (trajet.dateArrivee) {
        addInfoLine(
          doc,
          "Arrivée prévue",
          moment(trajet.dateArrivee).format("DD/MM/YYYY à HH:mm")
        );

        // Calculer la durée
        const duree = moment(trajet.dateArrivee).diff(
          moment(trajet.dateDepart),
          "hours",
          true
        );
        addInfoLine(doc, "Durée estimée", `${duree.toFixed(1)} heures`);
      }

      doc.moveDown(1);

      // --- KILOMÉTRAGE ---
      addSection(doc, "KILOMÉTRAGE");

      if (trajet.kilometrageDepart) {
        addInfoLine(
          doc,
          "Kilométrage départ",
          `${trajet.kilometrageDepart.toLocaleString()} km`
        );
      }

      if (trajet.kilometrageArrivee) {
        addInfoLine(
          doc,
          "Kilométrage arrivée",
          `${trajet.kilometrageArrivee.toLocaleString()} km`
        );

        if (trajet.kilometrageDepart) {
          const distance = trajet.kilometrageArrivee - trajet.kilometrageDepart;
          addInfoLine(
            doc,
            "Distance parcourue",
            `${distance.toLocaleString()} km`,
            "#27ae60"
          );
        }
      }

      doc.moveDown(1);

      // --- CONSOMMATION ---
      if (trajet.consommationGasoil) {
        addSection(doc, "CONSOMMATION CARBURANT");

        addInfoLine(
          doc,
          "Gasoil consommé",
          `${trajet.consommationGasoil} litres`
        );

        if (trajet.kilometrageDepart && trajet.kilometrageArrivee) {
          const distance = trajet.kilometrageArrivee - trajet.kilometrageDepart;
          const moyenne = (
            (trajet.consommationGasoil / distance) *
            100
          ).toFixed(2);
          addInfoLine(doc, "Consommation moyenne", `${moyenne} L/100km`);
        }

        doc.moveDown(1);
      }

      // --- MARCHANDISE ---
      addSection(doc, "MARCHANDISE");

      if (trajet.marchandise) {
        addInfoLine(doc, "Description", trajet.marchandise);
      } else {
        addInfoLine(doc, "Description", "Non spécifiée");
      }

      if (trajet.poids) {
        addInfoLine(doc, "Poids", `${trajet.poids.toLocaleString()} kg`);
      }

      doc.moveDown(1);

      // --- OBSERVATIONS ---
      if (trajet.observations) {
        addSection(doc, "OBSERVATIONS");

        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#34495e")
          .text(trajet.observations, {
            width: 500,
            align: "justify",
          });

        doc.moveDown(1);
      }

      // --- SIGNATURE ---
      doc.moveDown(2);

      doc
        .strokeColor("#bdc3c7")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(1);

      doc
        .fontSize(9)
        .font("Helvetica-Oblique")
        .fillColor("#7f8c8d")
        .text("Document généré automatiquement par Fleet Management System", {
          align: "center",
        });

      doc
        .fontSize(8)
        .text(
          `Date de génération : ${moment().format("DD/MM/YYYY à HH:mm:ss")}`,
          { align: "center" }
        );

      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#2c3e50")
        .text("Signature numérique certifiée", { align: "center" });

      // Finaliser le PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Ajoute une section titre dans le PDF
 */
const addSection = (doc, title) => {
  doc.fontSize(14).font("Helvetica-Bold").fillColor("#2c3e50").text(title);

  doc.moveDown(0.3);

  doc
    .strokeColor("#3498db")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(200, doc.y)
    .stroke();

  doc.moveDown(0.5);
};

/**
 * Ajoute une ligne d'information clé-valeur
 */
const addInfoLine = (doc, label, value, color = "#34495e") => {
  const startY = doc.y;

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#7f8c8d")
    .text(`${label}:`, 70, startY, { width: 150, continued: false });

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor(color)
    .text(value || "N/A", 230, startY, { width: 300 });

  doc.moveDown(0.3);
};

/**
 * Formate le statut du trajet avec des couleurs
 */
const formatStatut = (statut) => {
  const statutMap = {
    planifié: " Planifié",
    "en cours": " En cours",
    terminé: " Terminé",
    annulé: " Annulé",
  };

  return statutMap[statut] || statut;
};

module.exports = {
  generateTrajetPDF,
};
