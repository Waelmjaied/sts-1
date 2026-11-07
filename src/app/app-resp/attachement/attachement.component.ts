import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  ArticleDTO,
  RaccordementSoutraitantDTO,
  Soutraitance,
  AttachementTableRow,
  Operateur,
  DataAttachamentDTO
} from './models';
import { GestionService } from '../../gestion.service';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-attachement',
    templateUrl: './attachement.component.html',
    styleUrl: './attachement.component.css',
    standalone: false
})
export class AttachementComponent implements OnInit {

  @ViewChild('topScroll')
  topScroll?: ElementRef<HTMLDivElement>;

  @ViewChild('tableScroll')
  tableScroll?: ElementRef<HTMLDivElement>;
  // ============================================================
  // DATA
  // ============================================================

  articles: ArticleDTO[] = [];

  raccordements: RaccordementSoutraitantDTO[] = [];

  rows: AttachementTableRow[] = [];

  filteredRows: AttachementTableRow[] = [];


  // ============================================================
  // DROPDOWNS
  // ============================================================

  soutraitances: Soutraitance[] = [];

  operateurs: Operateur[] = [];


  // ============================================================
  // FILTERS
  // ============================================================

  filterSoutraitanceId: string = '';

  filterOperateur: string = '';

  filterDateRDV: string = '';

  filterDateDebut: string = '';

  filterDateFin: string = '';


  // ============================================================
  // PAGINATION
  // ============================================================

  currentPage = 1;

  /*
   * -1 = ALL
   */
  itemsPerPage = 10;


  // ============================================================
  // STATE
  // ============================================================

  isLoading = false;

  hasSearched = false;


  // ============================================================
  // SORTING
  // ============================================================

  sortField = '';

  sortDirection: 'asc' | 'desc' = 'asc';


  toggleSort(field: 'crm' | 'nomChef' | 'dateRDV'): void {

    if (this.sortField === field) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortField = field;
      this.sortDirection = 'asc';

    }

    this.applySorting();

  }


  applySorting(): void {

    if (!this.sortField) {

      this.currentPage = 1;

      return;

    }


    this.filteredRows =
      [...this.filteredRows].sort((a, b) => {

        let aValue: string = '';
        let bValue: string = '';


        switch (this.sortField) {

          case 'crm':

            aValue = a.crm || '';
            bValue = b.crm || '';

            break;


          case 'nomChef':

            aValue = a.nomChef || '';
            bValue = b.nomChef || '';

            break;


          case 'dateRDV':

            aValue = a.dateRDV || '';
            bValue = b.dateRDV || '';

            break;

        }


        const result =
          String(aValue).localeCompare(
            String(bValue),
            'fr',
            {
              numeric: true,
              sensitivity: 'base'
            }
          );


        return this.sortDirection === 'asc'
          ? result
          : -result;

      });


    this.currentPage = 1;

  }

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private gest: GestionService
  ) {}


  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    this.loadSoutraitances();

    this.loadOperateurs();

  }


  // ============================================================
  // LOAD SOUS-TRAITANTS
  // ============================================================

  loadSoutraitances(): void {

    this.gest.getAllSoutraitances().subscribe({

      next: (data: any[]) => {

        this.soutraitances =
          (data || []).map(item => ({

            id: item.id,

            label:
              item.label ??
              item.nom ??
              item.nomEntreprise ??
              item.raisonSociale ??
              ''

          }));

      },

      error: err => {

        console.error(
          'Erreur lors du chargement des sous-traitants :',
          err
        );

        this.soutraitances = [];

      }

    });

  }


  // ============================================================
  // LOAD OPERATEURS
  // ============================================================

  loadOperateurs(): void {

    this.gest.getAllOperateurs().subscribe({

      next: (data: any[]) => {

        this.operateurs = data || [];

      },

      error: err => {

        console.error(
          'Erreur lors du chargement des opérateurs :',
          err
        );

        this.operateurs = [];

      }

    });

  }


  // ============================================================
  // LOAD ATTACHEMENTS
  // ============================================================

  loadAttachements(): void {

    this.isLoading = true;

    const filters = {

      soutraitanceId:
        this.filterSoutraitanceId
          ? this.filterSoutraitanceId
          : null,

      nomOperateur:
        this.filterOperateur
          ? this.filterOperateur
          : null,

      dateRDV:
        this.filterDateRDV
          ? this.filterDateRDV
          : null,

      dateDebut:
        this.filterDateDebut
          ? this.filterDateDebut
          : null,

      dateFin:
        this.filterDateFin
          ? this.filterDateFin
          : null

    };


    this.gest.getAttachements(filters).subscribe({

      next: (data: DataAttachamentDTO) => {

        this.articles =
          data?.articles || [];


        this.raccordements =
          data?.raccordementSoutraitantDTOS || [];


        this.buildRows();


        this.hasSearched = true;

        this.isLoading = false;

      },


      error: err => {

        console.error(
          'Erreur lors du chargement des attachements :',
          err
        );


        this.articles = [];

        this.raccordements = [];

        this.rows = [];

        this.filteredRows = [];

        this.isLoading = false;

      }

    });

  }


  // ============================================================
  // BUILD TABLE
  // ============================================================

  buildRows(): void {

    this.rows =
      this.raccordements.map(raccordement => {

        const articles: {
          [articleId: number]: number;
        } = {};


        /*
         * Initialize every dynamic article with 0.
         */

        this.articles.forEach(article => {

          articles[article.articleId] = 0;

        });


        /*
         * Aggregate quantities:
         *
         * raccordement
         *      └── taches
         *            └── articlesTache
         */

        raccordement.taches?.forEach(tache => {

          tache.articlesTache?.forEach(articleTache => {

            const articleId =
              articleTache.articleId;


            const quantite =
              articleTache.quantite || 0;


            articles[articleId] =
              (articles[articleId] || 0) +
              quantite;

          });

        });


        return {

          raccordementID:
          raccordement.raccordementID,

          crm:
            raccordement.crm || '',

          etat:
            raccordement.etat || '',

          nomChef:
            raccordement.nomChef || '',

          dateRDV:
            raccordement.dateRDV || '',

          heureRDV:
            raccordement.heureRDV || '',

          articles

        };

      });


    this.filteredRows =
      [...this.rows];


    this.currentPage = 1;

  }


  // ============================================================
  // APPLY FILTERS
  // ============================================================

  applyFilters(): void {

    this.loadAttachements();

  }


  // ============================================================
  // RESET
  // ============================================================

  resetFilters(): void {

    this.filterSoutraitanceId = '';

    this.filterOperateur = '';

    this.filterDateRDV = '';

    this.filterDateDebut = '';

    this.filterDateFin = '';


    this.sortField = '';

    this.sortDirection = 'asc';


    this.rows = [];

    this.filteredRows = [];

    this.articles = [];

    this.raccordements = [];


    this.currentPage = 1;

    this.itemsPerPage = 10;

    this.hasSearched = false;

  }


  // ============================================================
  // DATE VALIDATION
  // ============================================================

  onDateRDVChange(): void {

    if (this.filterDateRDV) {

      this.filterDateDebut = '';

      this.filterDateFin = '';

    }

  }


  onDateRangeChange(): void {

    if (
      this.filterDateDebut ||
      this.filterDateFin
    ) {

      this.filterDateRDV = '';

    }

  }


  // ============================================================
  // PAGINATION
  // ============================================================

  paginatedRows(): AttachementTableRow[] {

    /*
     * -1 = ALL
     */

    if (this.itemsPerPage === -1) {

      return this.filteredRows;

    }


    const start =
      (this.currentPage - 1) *
      this.itemsPerPage;


    return this.filteredRows.slice(
      start,
      start + this.itemsPerPage
    );

  }


  // ============================================================
  // DISPLAY ROWS
  // ============================================================

  getDisplayRows(): AttachementTableRow[] {

    return this.paginatedRows();

  }


  // ============================================================
  // TOTAL PAGES
  // ============================================================

  totalPages(): number {

    /*
     * ALL
     */

    if (this.itemsPerPage === -1) {

      return 1;

    }


    return Math.ceil(
      this.filteredRows.length /
      this.itemsPerPage
    ) || 1;

  }


  // ============================================================
  // NEXT PAGE
  // ============================================================

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages()
    ) {

      this.currentPage++;

    }

  }


  // ============================================================
  // PREVIOUS PAGE
  // ============================================================

  prevPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

    }

  }


  // ============================================================
  // FIRST PAGE
  // ============================================================

  firstPage(): void {

    this.currentPage = 1;

  }


  // ============================================================
  // LAST PAGE
  // ============================================================

  lastPage(): void {

    this.currentPage =
      this.totalPages();

  }


  // ============================================================
  // GO TO PAGE
  // ============================================================

  goToPage(page: number): void {

    if (
      page >= 1 &&
      page <= this.totalPages()
    ) {

      this.currentPage = page;

    }

  }


  // ============================================================
  // ITEMS PER PAGE
  // ============================================================

  onItemsPerPageChange(): void {

    this.currentPage = 1;

  }


  // ============================================================
  // START INDEX
  // ============================================================

  getStartIndex(): number {

    if (!this.filteredRows.length) {

      return 0;

    }


    if (this.itemsPerPage === -1) {

      return 1;

    }


    return (
      (this.currentPage - 1) *
      this.itemsPerPage
    ) + 1;

  }


  // ============================================================
  // END INDEX
  // ============================================================

  getEndIndex(): number {

    if (this.itemsPerPage === -1) {

      return this.filteredRows.length;

    }


    return Math.min(
      this.currentPage *
      this.itemsPerPage,
      this.filteredRows.length
    );

  }


  // ============================================================
  // PAGE NUMBERS
  // ============================================================

  getPageNumbers(): number[] {

    const total =
      this.totalPages();


    const current =
      this.currentPage;


    const delta = 2;


    const range: number[] = [];

    const rangeWithDots: number[] = [];


    let previous:
      number | undefined;


    for (
      let i = 1;
      i <= total;
      i++
    ) {

      if (
        i === 1 ||
        i === total ||
        (
          i >= current - delta &&
          i <= current + delta
        )
      ) {

        range.push(i);

      }

    }


    range.forEach(i => {

      if (
        previous !== undefined
      ) {

        if (
          i - previous === 2
        ) {

          rangeWithDots.push(
            previous + 1
          );

        } else if (
          i - previous !== 1
        ) {

          rangeWithDots.push(-1);

        }

      }


      rangeWithDots.push(i);

      previous = i;

    });


    return rangeWithDots;

  }


  // ============================================================
  // ARTICLE QUANTITY
  // ============================================================

  getArticleQuantity(
    row: AttachementTableRow,
    articleId: number
  ): number {

    return (
      row.articles[articleId] || 0
    );

  }


  // ============================================================
  // ARTICLE TOTAL
  // ============================================================

  getArticleTotal(
    articleId: number
  ): number {

    return this.filteredRows.reduce(
      (total, row) => {

        return total +
          this.getArticleQuantity(
            row,
            articleId
          );

      },
      0
    );

  }


  // ============================================================
  // TOTAL OF ALL ARTICLES
  // ============================================================

  getTotalArticleCount(): number {

    return this.articles.reduce(
      (total, article) => {

        return total +
          this.getArticleTotal(
            article.articleId
          );

      },
      0
    );

  }


  // ============================================================
  // SELECTED SOUS-TRAITANCE
  // ============================================================

  getSelectedSoutraitanceName(): string {

    if (!this.filterSoutraitanceId) {

      return 'Tous';

    }


    const selected =
      this.soutraitances.find(
        s =>
          String(s.id) ===
          String(this.filterSoutraitanceId)
      );


    return selected?.label || 'Tous';

  }


  // ============================================================
  // SELECTED OPERATOR
  // ============================================================

  getSelectedOperatorName(): string {

    if (!this.filterOperateur) {

      return 'Tous';

    }


    const selected =
      this.operateurs.find(
        o =>
          o.nomOperateur ===
          this.filterOperateur
      );


    return selected?.nomOperateur ||
      'Tous';

  }


  // ============================================================
  // REFRESH
  // ============================================================

  refreshData(): void {

    if (this.hasSearched) {

      this.loadAttachements();

    }

  }


  // ============================================================
  // RESULT COUNT
  // ============================================================

  getResultCount(): number {

    return this.filteredRows.length;

  }


  // ============================================================
  // EXPORT FILE NAME
  // ============================================================

  private buildExportFileName(): string {

    const sousTraitant =
      this.getSelectedSoutraitanceName() ||
      'Tous';


    const operateur =
      this.getSelectedOperatorName() ||
      'Tous';


    let datePart =
      'Toutes_dates';


    if (this.filterDateRDV) {

      datePart =
        `RDV_${this.filterDateRDV}`;

    } else if (
      this.filterDateDebut ||
      this.filterDateFin
    ) {

      datePart =
        `Du_${this.filterDateDebut || '...'}_Au_${this.filterDateFin || '...'}`;

    }


    const today =
      new Date();


    const todayStr =
      `${String(today.getDate()).padStart(2, '0')}-` +
      `${String(today.getMonth() + 1).padStart(2, '0')}-` +
      `${today.getFullYear()}`;


    const sanitize =
      (value: string): string => {

        return value
          .replace(/[<>:"/\\|?*]/g, '_')
          .replace(/\s+/g, '_');

      };


    return (
      `attachements_` +
      `${sanitize(sousTraitant)}_` +
      `${sanitize(operateur)}_` +
      `${sanitize(datePart)}_` +
      `${todayStr}.xlsx`
    );

  }

  onTopScroll(): void {
    if (!this.topScroll || !this.tableScroll) {
      return;
    }

    this.tableScroll.nativeElement.scrollLeft =
      this.topScroll.nativeElement.scrollLeft;
  }

  onTableScroll(): void {
    if (!this.topScroll || !this.tableScroll) {
      return;
    }

    this.topScroll.nativeElement.scrollLeft =
      this.tableScroll.nativeElement.scrollLeft;
  }
  getTableMinWidth(): number {

    const fixedColumnsWidth = 415;

    const articleColumnWidth = 150;

    return (
      fixedColumnsWidth +
      (this.articles?.length || 0) *
      articleColumnWidth
    );

  }
  // ============================================================
  // EXPORT EXCEL
  // ============================================================

// ============================================================
// EXPORT EXCEL
// ============================================================

  async exportExcel(): Promise<void> {

    if (!this.filteredRows.length) {

      alert(
        'Aucun attachement ne correspond aux critères sélectionnés.'
      );

      return;

    }


    try {

      this.isLoading = true;


      // ========================================================
      // WORKBOOK
      // ========================================================

      const workbook =
        new ExcelJS.Workbook();

      workbook.creator =
        'STS LINK';

      workbook.created =
        new Date();

      workbook.modified =
        new Date();


      // ========================================================
      // WORKSHEET
      // ========================================================

      const sheet =
        workbook.addWorksheet(
          'Attachements'
        );


      // ========================================================
      // FONTS
      // ========================================================

      const baseFont = {

        name: 'Calibri',

        size: 11

      };


      const boldFont = {

        ...baseFont,

        bold: true

      };


      const titleFont = {

        ...baseFont,

        bold: true,

        size: 15,

        color: {
          argb: 'FF1F4E79'
        }

      };


      const headerFont = {

        ...baseFont,

        bold: true,

        size: 11,

        color: {
          argb: 'FFFFFFFF'
        }

      };


      // ========================================================
      // GENERAL
      // ========================================================

      /*
       * 3 fixed columns:
       * 1 = CRM
       * 2 = Chef d'équipe
       * 3 = Date RDV
       *
       * Then dynamic article columns.
       */

      const totalColumns =
        3 + this.articles.length;


      /*
       * Row 1 intentionally remains completely empty.
       *
       * IMPORTANT:
       * Do NOT use "header" inside sheet.columns,
       * otherwise ExcelJS automatically creates headers
       * on row 1.
       */

      const emptyFirstRow =
        sheet.getRow(1);

      emptyFirstRow.height = 8;


      let currentRow = 2;


      // ========================================================
      // TITLE
      // ========================================================

      const titleRow =
        sheet.getRow(currentRow);


      titleRow.getCell(1).value =
        'ATTACHEMENTS – RACCORDEMENTS';


      titleRow.getCell(1).font =
        titleFont;


      sheet.mergeCells(
        currentRow,
        1,
        currentRow,
        totalColumns
      );


      titleRow.alignment = {

        vertical: 'middle',

        horizontal: 'left'

      };


      titleRow.height = 26;


      currentRow += 2;


      // ========================================================
      // FILTER INFORMATION
      // ========================================================

      const filterData: Array<
        [string, string | number]
      > = [

        [
          'Sous-traitant',
          this.getSelectedSoutraitanceName()
        ],

        [
          'Opérateur',
          this.getSelectedOperatorName()
        ],

        [
          'Date RDV',
          this.filterDateRDV || 'Toutes'
        ],

        [
          'Période',
          (
            this.filterDateDebut ||
            this.filterDateFin
          )
            ? `${this.filterDateDebut || '...'} → ${this.filterDateFin || '...'}`
            : 'Toutes'
        ],

        [
          'Nombre de raccordements',
          this.filteredRows.length
        ]

      ];


      filterData.forEach(
        ([label, value]) => {

          const row =
            sheet.getRow(currentRow++);


          row.getCell(1).value =
            label;


          row.getCell(1).font =
            boldFont;


          row.getCell(1).fill = {

            type: 'pattern',

            pattern: 'solid',

            fgColor: {
              argb: 'FFD9EAF7'
            }

          };


          row.getCell(2).value =
            value;


          row.getCell(2).alignment = {

            horizontal: 'left'

          };


          row.eachCell(cell => {

            cell.border = {

              top: {
                style: 'thin'
              },

              left: {
                style: 'thin'
              },

              bottom: {
                style: 'thin'
              },

              right: {
                style: 'thin'
              }

            };

          });

        }
      );


      currentRow++;


      // ========================================================
      // COLUMN WIDTHS
      // ========================================================

      sheet.getColumn(1).width = 20; // CRM
      sheet.getColumn(2).width = 25; // Chef
      sheet.getColumn(3).width = 18; // Date RDV


      this.articles.forEach(
        (article, index) => {

          sheet.getColumn(
            4 + index
          ).width = 20;

        }
      );


      // ========================================================
      // TABLE HEADER
      // ========================================================

      const headerRowNumber =
        currentRow;


      const headerRow =
        sheet.getRow(
          headerRowNumber
        );


      // --------------------------------------------------------
      // FIXED HEADERS
      // --------------------------------------------------------

      headerRow.getCell(1).value =
        'CRM';


      headerRow.getCell(2).value =
        "Chef d'équipe";


      headerRow.getCell(3).value =
        'Date RDV';


      // --------------------------------------------------------
      // ARTICLE HEADERS
      // --------------------------------------------------------

      this.articles.forEach(
        (article, index) => {

          const column =
            4 + index;


          headerRow.getCell(
            column
          ).value =
            `${article.article}\nTotal: ${this.getArticleTotal(article.articleId)}`;

        }
      );


      // ========================================================
      // HEADER STYLE
      // ========================================================

      headerRow.font =
        headerFont;


      headerRow.fill = {

        type: 'pattern',

        pattern: 'solid',

        fgColor: {
          argb: 'FF1F4E79'
        }

      };


      headerRow.alignment = {

        vertical: 'middle',

        horizontal: 'center',

        wrapText: true

      };


      headerRow.height = 42;


      headerRow.eachCell(cell => {

        cell.border = {

          top: {
            style: 'thin'
          },

          left: {
            style: 'thin'
          },

          bottom: {
            style: 'thin'
          },

          right: {
            style: 'thin'
          }

        };

      });


      currentRow++;


      // ========================================================
      // DATA
      // ========================================================

      this.filteredRows.forEach(
        row => {

          const dataRow =
            sheet.getRow(currentRow++);


          // ----------------------------------------------------
          // FIXED COLUMNS
          // ----------------------------------------------------

          dataRow.getCell(1).value =
            row.crm || '';


          dataRow.getCell(2).value =
            row.nomChef || '';


          dataRow.getCell(3).value =
            row.dateRDV || '';


          // ----------------------------------------------------
          // ARTICLES
          // ----------------------------------------------------

          this.articles.forEach(
            (article, index) => {

              dataRow.getCell(
                4 + index
              ).value =
                this.getArticleQuantity(
                  row,
                  article.articleId
                );

            }
          );


          // ----------------------------------------------------
          // STYLE
          // ----------------------------------------------------

          dataRow.font =
            baseFont;


          dataRow.alignment = {

            vertical: 'middle',

            horizontal: 'center',

            wrapText: true

          };


          dataRow.eachCell(cell => {

            cell.border = {

              top: {
                style: 'thin'
              },

              left: {
                style: 'thin'
              },

              bottom: {
                style: 'thin'
              },

              right: {
                style: 'thin'
              }

            };

          });

        }
      );


      // ========================================================
      // TOTAL ROW
      // ========================================================

      const totalRow =
        sheet.getRow(currentRow++);


      totalRow.getCell(1).value =
        'TOTAL';


      totalRow.getCell(2).value =
        '';


      totalRow.getCell(3).value =
        `${this.filteredRows.length} raccordement(s)`;


      // --------------------------------------------------------
      // ARTICLE TOTALS
      // --------------------------------------------------------

      this.articles.forEach(
        (article, index) => {

          totalRow.getCell(
            4 + index
          ).value =
            this.getArticleTotal(
              article.articleId
            );

        }
      );


      // ========================================================
      // TOTAL STYLE
      // ========================================================

      totalRow.font = {

        ...baseFont,

        bold: true,

        size: 12

      };


      totalRow.fill = {

        type: 'pattern',

        pattern: 'solid',

        fgColor: {
          argb: 'FFE2E8F0'
        }

      };


      totalRow.alignment = {

        vertical: 'middle',

        horizontal: 'center'

      };


      totalRow.height = 27;


      totalRow.eachCell(cell => {

        cell.border = {

          top: {
            style: 'medium'
          },

          bottom: {
            style: 'medium'
          },

          left: {
            style: 'thin'
          },

          right: {
            style: 'thin'
          }

        };

      });


      // ========================================================
      // FREEZE PANES
      // ========================================================

      sheet.views = [

        {

          state: 'frozen',

          /*
           * Freeze the 3 fixed columns:
           * CRM | Chef d'équipe | Date RDV
           */

          xSplit: 3,

          ySplit: 0,

          topLeftCell: 'D1',

          activeCell: 'D1'

        }

      ];


      // ========================================================
      // AUTO FILTER
      // ========================================================

      sheet.autoFilter = {

        from: {

          row: headerRowNumber,

          column: 1

        },

        to: {

          row: currentRow - 1,

          column: totalColumns

        }

      };


      // ========================================================
      // PRINT SETTINGS
      // ========================================================

      sheet.pageSetup = {

        orientation: 'landscape',

        fitToPage: true,

        fitToWidth: 1,

        fitToHeight: 0,

        paperSize: 9

      };


      // ========================================================
      // EXPORT
      // ========================================================

      const buffer =
        await workbook.xlsx.writeBuffer();


      if (
        !buffer ||
        buffer.byteLength === 0
      ) {

        throw new Error(
          'Le buffer Excel est vide.'
        );

      }


      const blob =
        new Blob(
          [buffer],
          {
            type:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        );


      saveAs(
        blob,
        this.buildExportFileName()
      );


    } catch (error) {

      console.error(
        'Erreur export Excel :',
        error
      );


      alert(
        'Une erreur est survenue pendant la génération du fichier Excel.'
      );


    } finally {

      this.isLoading = false;

    }

  }

}
