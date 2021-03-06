<template>
    <section>

        <breadcrub name="Gestión de Servicios" icon="wrench"/>

        <p class="buttons">
            <a class="button is-success is-small is-rounded" @click="isComponentModalCreateSupportActive = true">
                <span>{{global.button.new}}</span>
                <span class="icon is-small">
                <i class="fas fa-plus"></i>
                </span>
            </a>
            <a class="button is-danger is-small is-rounded" @click="cancel()">
                <span>{{global.button.cancel}}</span>
                <span class="icon is-small">
                <i class="fas fa-times"></i>
                </span>
            </a>
            <a class="button is-info is-small is-rounded" @click="deselect()">
                <span>{{global.button.deselect}}</span>
                <span class="icon is-small">
                <i class="fas fa-bolt"></i>
                </span>
            </a>
        </p>

        <!--Modals-->
        <b-modal :active.sync="isComponentModalCreateSupportActive" has-modal-card :width="960">
            <modal-create-support @hijo:change="listenSon"></modal-create-support>
        </b-modal>

        <b-modal :active.sync="isComponentModalDetailsSupportActive" has-modal-card :width="960">
            <modal-details-support :dataSupport="data" :nroSupport="nroSupport"></modal-details-support>
        </b-modal>

        <b-modal :active.sync="isComponentModalDetailsClientActive" has-modal-card :width="960">
            <modal-details-client :idClient="idClient"></modal-details-client>
        </b-modal>
        <!--End Modals-->

        <b-table
            :data="isEmpty ? [] : data"
            :bordered="isBordered"
            :striped="isStriped"
            :narrowed="isNarrowed"
            :hoverable="isHoverable"
            :loading="isLoading"
            :focusable="isFocusable"
            :mobile-cards="hasMobileCards"

            :selected.sync="selected"
            
            :paginated="isPaginated"
            :per-page="perPage"
            :current-page.sync="currentPage"
            :pagination-simple="isPaginationSimple"
            :default-sort-direction="defaultSortDirection">

            <template slot-scope="props">

                <b-table-column field="date" label="Creado" centered sortable>
                    <span class="tag is-primary">
                        {{ convertDate(props.row.createdAt.substring(0, 10)) }}
                    </span>
                </b-table-column>

                <b-table-column field="issue" label="Asunto" centered sortable>
                    {{ props.row.issue }}
                </b-table-column>

                 <b-table-column field="assigned" label="Asignado" centered sortable>
                    <!--{{ clients._id == props.row.id_client ? clients.name : 'n/a' }}-->
                    
                    <a class="button is-success is-small" @click="loadDetailsClient(props.row.assigned)" v-if="props.row.assigned!=''">
                        <span class="icon is-small">
                        <i class="fas fa-user-astronaut"></i>
                        </span>
                    </a>
                    <div v-else>
                        <a class="button is-danger is-small">
                            <span class="icon is-small">
                            <i class="fas fa-times"></i>
                            </span>
                        </a>
                    </div>
                    
                </b-table-column>

                <b-table-column field="status" label="Estado" centered sortable>
                    <b-tag 
                    :type="
                        props.row.status == 'P' ? 'is-warning' : 
                        props.row.status == 'A' ? 'is-info' : 
                        props.row.status == 'R' ? 'is-danger' : 
                        props.row.status == 'F' ? 'is-success' : 'is-dark' ">

                        {{ props.row.status == 'P' ? 'Pendiente' : 
                        props.row.status == 'A' ? 'Aprobado' : 
                        props.row.status == 'R' ? 'Rechazado por Técnico' :
                        props.row.status == 'F' ? 'Finalizada' : 'Rechazado por Cliente' }}
                        
                        </b-tag>
                </b-table-column>

                <b-table-column field="more" label="Detalles" centered sortable>
                    <a class="button is-info is-small" @click="loadDetailsSupport(props.row.nro)">
                        <span class="icon is-small">
                        <i class="fas fa-info"></i>
                        </span>
                    </a>
                </b-table-column>

            </template>

            <template slot="empty">
                <section class="section">
                    <div class="content has-text-grey has-text-centered">
                        <p>
                            <b-icon
                                pack="fas"
                                icon="frown-open"
                                size="is-large">
                            </b-icon>
                        </p>
                        <p>Nothing here.</p>
                    </div>
                </section>
            </template>
        </b-table>
    </section>
</template>

<script>
import global from "@/config/global.js";
import axios from "@/config/axios.js";

//Components
import ModalCreateSupport from "@/components/views/ModalCreateSupport.vue";
import ModalDetailsSupport from "@/components/views/ModalDetailsSupport.vue";
import ModalDetailsClient from "@/components/views/ModalDetailsClient.vue";

//Templates
import Breadcrub from "@/components/templates/Breadcrub.vue";

export default {
  data() {
    return {
      isComponentModalCreateSupportActive: false,
      isComponentModalDetailsSupportActive: false,
      isComponentModalDetailsClientActive: false,
      idClient: '',
      nroSupport: '',

      global: global.text,

      data: [],

      isEmpty: false,
      isBordered: false,
      isStriped: true,
      isNarrowed: true,
      isHoverable: true,
      isFocusable: false,
      isLoading: false,
      hasMobileCards: true,

      selected: "",

      isPaginated: true,
      isPaginationSimple: false,
      defaultSortDirection: "asc",
      currentPage: 1,
      perPage: 7
    };
  },

  components: {
    ModalCreateSupport,
    ModalDetailsSupport,
    ModalDetailsClient,
    Breadcrub
  },

  methods: {
    listenSon() {
      this.refreshData();
    },

    deselect(){
        this.selected = ''
    },

    async refreshData() {
      await axios
        .get(`/support/ref/${this.$cookie.get("ref")}`, {
            headers: { Authorization: "bearer " + this.$cookie.get("token") }
        })
        .then(res => {
          if (res.data.res) {
            this.data = res.data.support;
            
          }
        })
        .catch(err => {
          alert(err);
        });
    },

    convertStatus(status){
        let aux = ''
        if(status=='P'){
            aux = {
                name: 'Pendiente',
                tag: 'is-warning'
            }
        }
        if(status=='A'){
            aux = {
                name: 'Aprobado',
                tag: 'is-success'
            }
        }
        if(status=='R'){
            aux = {
                name: 'Rechazado',
                tag: 'is-danger'
            }
        }
        if(status=='C'){
            aux = {
                name: 'Cancelado',
                tag: 'is-dark'
            }
        }
        return aux
    },

    loadDetailsSupport(nro){
        this.nroSupport = nro;
        this.isComponentModalDetailsSupportActive = true;

    },

    loadDetailsClient(idClient){
        this.idClient = idClient;
        this.isComponentModalDetailsClientActive = true;
    },

    cancel(){

        //TODO 
        /*
        Quitar el codigo duro que tengo aqui jeje
        */
        if(this.selected==''){
            this.$toast.open({
                message: 'Seleccione una fila',
                type: 'is-warning'
            })
        }else{
            this.$dialog.confirm({
                title: 'Cancelar solicitud',
                message: `¿Estás seguro de cancelar la solicitud de soporte nro. #${this.selected.nro}?`,
                confirmText: 'Cancelar',
                type: 'is-danger',
                hasIcon: true,
                icon: 'times',
                iconPack: 'fas',
                onConfirm: async () => {
                    this.selected.status = 'C'
                    await axios
                    .put(`/support/changestatus/${this.selected._id}`, this.selected, {
                        headers: { Authorization: "bearer " + this.$cookie.get("token") }
                    })
                    .then(res => {
                        if(res.data.res){
                            this.$toast.open({
                                message: 'Solicitud Cancelada',
                                type: 'is-success'
                            })
                        }
                    })
                    .catch(err => {
                        alert(err)
                    })

                    await this.refreshData();
                }
            })
        }
    },

    convertDate(date){
        let temp = date.split('-')
        return `${temp[2]}-${temp[1]}-${temp[0]}`
    }

  },
  created() {
    this.refreshData();
  },
  watch: {
    $route: "refreshData"
  }
};
</script>

<style scoped>

.dialog .modal-card {
    max-height: 200px;
}

</style>

