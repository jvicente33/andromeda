<template>
<div id="dash">

  <nav class="navbar is-transparent">
    <div class="navbar-brand">
      <a class="navbar-item" @click="go('home')">
        <img src="img/logo.svg" alt="Andromeda" width="50" height="28">
        <h1 class="title is-5">Andromeda</h1>
      </a>
      <div class="navbar-burger burger" data-target="moreNavbar" @click="burger()">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div id="moreNavbar" class="navbar-menu">
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="field is-grouped">

            <b-dropdown hoverable>
              <button class="button is-vcentered is-primary is-outlined is-rounded" slot="trigger">
                  <span>{{userData.username}}</span>
                  <b-icon
                    pack="fas"
                    icon="bars"
                    size="is-small">
                </b-icon>
              </button>

              <b-dropdown-item @click="isComponentModalUserActive = true">Cuenta</b-dropdown-item>
              <b-dropdown-item @click="logout()">Salir</b-dropdown-item>
            </b-dropdown>

          </div>
        </div>
      </div>
    </div>
  </nav>

  <div class="columns is-fullheight">
    <div class="column is-2 is-sidebar-menu is-hidden-mobile">
      <div class="container-photo">
        <img :src="userInfoData.photo == '' ? 'img/profile_default.svg' : api + '/uploads/profile/' + userInfoData.photo" class="photo">
        <p class="title is-5 fullname">{{userInfoData.name + ' ' + userInfoData.lastname}}</p>
      </div>
      
      <hr>

      <aside class="menu">
        <p class="menu-label title is-6">
          Menu
        </p>

        <ul class="menu-list">
          <li v-for="(item, itemIndex) in items" :key="itemIndex" @click="go(item.url)" v-show="item.role">
            <a>
              <b-icon
                pack="fas"
                :icon="item.icon"
                size="is-small">
              </b-icon>
              {{item.title}}
            </a>
          </li>
        </ul>

      </aside>
    </div>

    <div class="column is-main-content">

       <b-modal :active.sync="isComponentModalUserActive" has-modal-card :width="960">
            <modal-user-data :userData="userData" :userInfoData="userInfoData"></modal-user-data>
        </b-modal>

      <router-view></router-view>
    </div>
  </div>

  <footer class="footer">
    <div class="content has-text-centered">
      <p>
        &copy;2018 — <strong>Andromeda</strong>
      </p>
    </div>
  </footer>

  <b-loading :is-full-page="isFullPage" :active.sync="isLoading" :can-cancel="false"></b-loading>
</div>

</template>

<script>
import axios from "../../config/axios.js";
import BusEvent from "@/bus.js";

let dataInfopersonal = ''

BusEvent.$on('getInfopersonal', function (aux) {
  this.$log.debug(dataInfopersonal)
  return aux
})

//Components
import ModalUserData from "../views/ModalUserData.vue";


export default {
  data() {
    return {
      drawer: true,

      preLoading: 0,
      isLoading: true,
      isFullPage: true,

      isComponentModalUserActive: false,

      userData: "",
      userInfoData: "",
      api: process.env.VUE_APP_API_URL,

      items: [
        { title: "Home", icon: "home", role: true, type: "ALL", url: "homeforall" },
        {
          title: "Usuarios",
          icon: "users",
          role: false,
          type: "ALL",
          url: "users"
        },
        {
          title: "Servicios",
          icon: "wrench",
          role: false,
          type: "A",
          url: "supporta"
        },
        {
          title: "Servicios",
          icon: "wrench",
          role: false,
          type: "C",
          url: "supportc"
        },
        {
          title: "Reporte",
          icon: "clipboard",
          role: false,
          type: "A",
          url: "report"
        },
        {
          title: "Agenda",
          icon: "calendar-alt",
          role: false,
          type: "ALL",
          url: "calendar"
        },
        {
          title: "Facturación",
          icon: "dollar-sign",
          role: false,
          type: "A",
          url: "billadmin"
        },
        {
          title: "Facturación",
          icon: "dollar-sign",
          role: false,
          type: "C",
          url: "billclient"
        }
      ],
      right: null,
      menus: [{ title: "Cerrar Sesión" }]
    };
  },
  methods: {
    logout() {
      axios
        .get(`/logout`)
        .then(res => {
          if (res.data.res) {
            //this.$store.commit('SET_LAYOUT', 'login')
            //this.$router.push({name: 'login'})
            this.$cookie.delete("token");
            this.$cookie.delete("userId");
            this.$cookie.delete("ref");
            this.$cookie.delete("type_user");
            this.$cookie.delete("infopersonalId");
            location.reload();
          }
        })
        .catch(err => {
          alert(err);
        });
    },

    go(route) {
      this.$router.push({ name: route });
    },

    async loadDataUser() {

      //Datos del Usuario
      await axios
        .get(`/user/${this.$cookie.get("userId")}`, {
          headers: { Authorization: "bearer " + this.$cookie.get("token") }
        })
        .then(res => {
          this.userData = res.data.user;
          this.preLoading = this.preLoading + 1;
          this.$cookie.set('ref', this.userData.ref);
          this.$cookie.set('type_user', this.userData.type_user);
        })
        .catch(err => {
          alert(err);
        });

      //Datos personales del usuario
      await axios
        .get(`/infopersonal/${this.userData.id_infopersonal}`, {
          headers: { Authorization: "bearer " + this.$cookie.get("token") }
        })
        .then(res => {
          this.userInfoData = res.data.infoPersonal;
          this.preLoading = this.preLoading + 1;
          this.$cookie.set('infopersonalId', this.userInfoData._id);
        })
        .catch(err => {
          alert(err);
        });

        //this.$log.debug(this.preLoading)

      //Cargar roles para visualizar menu
      await this.loadRoleUser();

      //Desactivar loading
      await this.isNotLoading();
    },

    loadRoleUser() {
      if (this.preLoading == 2) {
        if (this.userData.type_user == 0) {
          if (this.userData.rol == "ALL") {
            this.items.forEach(i => {
              if (i.type == "ALL" || i.type == "A") {
                i.role = true;
              } else {
                i.role = false;
              }
            });
          } else {
            let auxRole = this.userData.rol.split("|");
            auxRole.forEach(i => {
              this.items.forEach(j => {
                if (i.type == "ALL" || i.type == "A") {
                  if (i == j.title) {
                    j.role = true;
                  }
                } else {
                  i.role = false;
                }
              });
            });
          }
        }

        if (this.userData.type_user == 1) {
          if (this.userData.rol == "ALL") {
            this.items.forEach(i => {
              if (i.type == "ALL" || i.type == "C") {
                i.role = true;
              } else {
                i.role = false;
              }
            });
          } else {
            let auxRole = this.userData.rol.split("|");
            auxRole.forEach(i => {
              this.items.forEach(j => {
                if (i.type == "ALL" || i.type == "C") {
                  if (i == j.title) {
                    j.role = true;
                  }
                } else {
                  i.role = false;
                }
              });
            });
          }
        }
      }
    },

    //Metodo para abrir el menu en vista movil
    burger() {
      let burger = document.querySelector(".burger");
      let nav = document.querySelector("#" + burger.dataset.target);

      burger.classList.toggle("is-active");
      nav.classList.toggle("is-active");
    },

    isNotLoading() {
      if (this.preLoading == 2) {
        this.isLoading = false;
      }
      //this.go('users')
      
    }

  },

  created() {
    this.loadDataUser();
  },
  watch: {
    $route: "loadDataUser"
  },
  components: {
    ModalUserData
  },

  mounted: function () {
      this.$nextTick(function () {
          //this.go('users');
      })
  }
};
</script>


<style scoped>
.navbar {
  height: 1em;
  -webkit-box-shadow: 0px 7px 36px -13px rgba(79, 147, 237, 0.75);
  -moz-box-shadow: 0px 7px 36px -13px rgba(79, 147, 237, 0.75);
  box-shadow: 0px 7px 36px -13px rgba(79, 147, 237, 0.75);
  margin-bottom: 10px;

  position: fixed;
  top: 0px;
  right: 0px;
  left: 0px;
  z-index: 4;
}

.menu-label {
  color: white;
}

.menu-list li a {
  color: white;
}

.menu-list li a:hover {
  color: black;
}

.is-sidebar-menu {
  padding: 2.5rem;
  background-color: #4f93ed;
  -webkit-box-shadow: 9px 10px 46px -6px rgba(74, 74, 74, 0.84);
  -moz-box-shadow: 9px 10px 46px -6px rgba(74, 74, 74, 0.84);
  box-shadow: 9px 10px 46px -6px rgba(74, 74, 74, 0.84);
  margin: 80px 20px 20px 20px;
  position: fixed;
  max-height: auto;
  z-index: 2;
}

.is-main-content {
  margin: 80px 20px 10px 265px;
  z-index: 1;
}

.footer {
  background-color: white;
  position: fixed;
  bottom: 0px;
  right: 0px;
  left: 0px;
  padding: 3px;
  z-index: 4;
}

.photo {
  width: 60%;
  border-radius: 50px;
  margin: auto;
  display: block;
}

.container-photo {
  margin: auto;
  display: block;
  margin-bottom: 25px;
  text-align: center;
}

.fullname {
  color: white;
}

hr {
  background-color: black;
  opacity: 0.3;
}

</style>




