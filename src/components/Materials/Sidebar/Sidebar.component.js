import _ from 'lodash';
import { mapGetters } from 'vuex';
import SaveMaterialInCollection from './../../Popup/SaveMaterialInCollection';
import AddCollection from './../../Popup/AddCollection';
import ShareMaterial from '~/components/Popup/ShareMaterial';
import Multiselect from './../../Multiselect';
import { validateHREF } from '~/components/_helpers';

export default {
  name: 'sidebar',
  props: {
    material: {}
  },
  components: {
    SaveMaterialInCollection,
    AddCollection,
    ShareMaterial,
    Multiselect
  },
  mounted() {
    this.$store
      .dispatch('checkMaterialInCollection', this.material.external_id)
      .then(collections => {
        const checked_collections = collections.results.map(item => item.id);
        this.my_checked_collections = checked_collections;
        this.checked_collections = checked_collections.slice(0);

        this.$nextTick().then(() => {
          this.full_loading = true;
        });
      });
    this.setSocialCounters();
    this.href = validateHREF(window.location.href);
  },
  data() {
    return {
      href: '',
      full_loading: false,
      collection: '',
      checked_collections: [],
      submitting: false,
      isShowSaveMaterial: false,
      isShowShareMaterial: false,
      isShowAddCollection: false
    };
  },
  methods: {
    /**
     * generate login URL
     * @returns {string}
     */
    getLoginLink() {
      return this.$store.getters.getLoginLink(this.$route);
    },
    /**
     * Show AddCollection popup
     */
    addCollection() {
      this.isShowAddCollection = true;
    },
    /**
     * Close AddCollection popup
     */
    closeAddCollection() {
      this.isShowAddCollection = false;
    },
    /**
     * Show SaveMaterial popup
     */
    addToCollection() {
      this.isShowSaveMaterial = true;
    },
    /**
     * Close SaveMaterial popup
     */
    closeSaveMaterial() {
      this.isShowSaveMaterial = false;
    },
    /**
     * Triggering event the save material
     */
    onSaveMaterial(collection) {
      this.submitting = true;

      return this.$store.dispatch('setMaterialInMyCollection', {
        collection_id: collection.id || collection,
        data: [
          {
            external_id: this.material.external_id
          }
        ]
      });
    },
    /**
     * Triggering event the remove material
     */
    onRemoveMaterial(collection) {
      this.submitting = true;

      return this.$store.dispatch('removeMaterialFromMyCollection', {
        collection_id: collection.id || collection,
        data: [
          {
            external_id: this.material.external_id
          }
        ]
      });
    },
    /**
     * generate copyright external link
     * @param copyright
     * @returns {string}
     */
    copyrightURL(copyright) {
      let str = '';

      switch (copyright) {
        case 'cc-by-30':
          str = 'https://creativecommons.org/licenses/by/3.0/legalcode';
          break;
        case 'cc-by':
        case 'cc-by-40':
          str = 'https://creativecommons.org/licenses/by/4.0/legalcode';
          break;
        case 'cc-by-nc':
        case 'cc-by-nc-40':
          str = 'https://creativecommons.org/licenses/by-nc/4.0/legalcode';
          break;
        case 'cc-by-nc-30':
          str = 'https://creativecommons.org/licenses/by-nc/3.0/legalcode';
          break;
        case 'yes':
        case 'cc-by-nc-nd':
        case 'cc-by-nc-nd-40':
          str = 'https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode';
          break;
        case 'cc-by-nc-nd-30':
          str = 'https://creativecommons.org/licenses/by-nc-nd/3.0/legalcode';
          break;
        case 'cc-by-nc-sa':
        case 'cc-by-nc-sa-40':
          str = 'https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode';
          break;
        case 'cc-by-nc-sa-30':
          str = 'https://creativecommons.org/licenses/by-nc-sa/3.0/legalcode';
          break;
        case 'cc-by-nd':
        case 'cc-by-nd-40':
          str = 'https://creativecommons.org/licenses/by-nd/4.0/legalcode';
          break;
        case 'cc-by-nd-30':
          str = 'https://creativecommons.org/licenses/by-nd/3.0/legalcode';
          break;
        case 'cc-by-sa':
        case 'cc-by-sa-40':
          str = 'https://creativecommons.org/licenses/by-sa/4.0/legalcode';
          break;
        case 'cc-by-sa-30':
          str = 'https://creativecommons.org/licenses/by-sa/3.0/legalcode';
          break;
        default:
          str = 'https://creativecommons.org/licenses/';
          break;
      }

      return str;
    },

    /**
     * Show the popup "Share rating"
     */
    showShareMaterial() {
      this.isShowShareMaterial = true;
    },

    /**
     * Close the popup "Share rating"
     */
    closeShareMaterial() {
      this.isShowShareMaterial = false;
      if (this.is_copied) {
        this.closeSocialSharing('link');
      }
    },

    /**
     * Set counters value for share buttons
     */
    setSocialCounters() {
      const interval = setInterval(() => {
        this.$nextTick().then(() => {
          const { material } = this;
          const { social_counters } = this.$refs;
          const linkedIn = social_counters.querySelector('#linkedin_counter');

          if (material && material.sharing_counters && linkedIn) {
            const share = material.sharing_counters.reduce(
              (prev, next) => {
                prev[next.sharing_type] = next;
                return prev;
              },
              {
                linkedin: {
                  counter_value: 0
                },
                twitter: {
                  counter_value: 0
                },
                link: {
                  counter_value: 0
                }
              }
            );

            if (share.linkedin) {
              linkedIn.innerText = share.linkedin.counter_value;
            }
            if (share.twitter) {
              social_counters.querySelector('#twitter_counter').innerText =
                share.twitter.counter_value;
            }
            if (share.link) {
              social_counters.querySelector('#url_counter').innerText =
                share.link.counter_value;
            }
            if (linkedIn) {
              clearInterval(interval);
            }
          }
        });
      }, 200);
    },

    /**
     * Event close social popups
     * @param type - String - social type
     */
    closeSocialSharing(type) {
      /** This block prevents the user from sharing a material multiple times */
      if (type === 'linkedin') {
        if (this.linkedin_shared === true){
          return
        }
        this.linkedin_shared = true;
      }
      if (type === 'twitter') {
        if (this.twitter_shared === true){
          return
        }
        this.twitter_shared = true;
      }
      if (type === 'link') {
        if (this.link_shared === true){
          return
        }
        this.link_shared = true;
      }

      this.$store
        .dispatch('setMaterialSocial', {
          id: this.$route.params.id,
          params: {
            shared: type
          }
        })
        .then(() => {
          this.setSocialCounters();
        });
    },
    getTitleTranslation( item, language ) {
      if (!_.isNil(item.title_translations) && !_.isEmpty(item.title_translations)) {
        return item.title_translations[language];
      }
      return item.name
    },
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'my_collections',
      'material_communities',
      'disciplines',
    ]),
    /**
     * Extend to the material fields "disciplines" & "educationallevels"
     * @returns {*}
     */
    extended_material() {
      const { material, disciplines } = this;
      let self = this;

      if(_.isNil(material) || _.isError(material)) {
        return material;
      }

      if (!_.isNil(disciplines)) {
        // TODO: material.disciplines is sometimes an Array with Object and sometimes with external_id
        // We should make the type consistent
        let disciplineTitles = _.map(material.disciplines, (discipline) => {
          let disciplineObj = (_.isObject(discipline)) ? discipline : disciplines[discipline];
          return this.getTitleTranslation(disciplineObj, self.$i18n.locale)
        });
        material.disciplineTitles = disciplineTitles.join(', ');
      }


      if (material.educationallevels.length) {
        let educationallevelsTitles = _.map(material.educationallevels, (level) => {
          let levelObj = (_.isObject(level)) ? level : self.$store.getters.getCategoryById(level);
          if(_.isNil(levelObj)) {
            return;
          }
          return this.getTitleTranslation(levelObj, self.$i18n.locale)
        });
        material.educationallevelsTitles = _.without(educationallevelsTitles, undefined).join('<br/>');
      }

      return material;
    }
  },
  watch: {
    /**
     * Get checked collection
     * @param collections - Array
     */
    checked_collections(collections) {
      if (this.full_loading) {
        let collections_for_material = {};
        if (collections.length) {
          collections_for_material = collections.reduce(
            (prev, next) => {
              if (this.my_checked_collections.indexOf(next) === -1) {
                prev.add.push(next);
              }
              if (prev.delete.length) {
                prev.delete = prev.delete.filter(item => item !== next);
              }
              return prev;
            },
            {
              add: [],
              delete: this.my_checked_collections.slice(0)
            }
          );
        } else {
          collections_for_material = {
            add: [],
            delete: this.my_checked_collections.slice(0)
          };
        }

        const requests = [];

        if (
          collections_for_material.add &&
          collections_for_material.add.length
        ) {
          collections_for_material.add.forEach(collection => {
            requests.push(this.onSaveMaterial(collection));
          });
        }

        if (
          collections_for_material.delete &&
          collections_for_material.delete.length
        ) {
          collections_for_material.delete.forEach(collection => {
            requests.push(this.onRemoveMaterial(collection));
          });
        }

        Promise.all(requests).then(() => {
          this.$store
            .dispatch('getMaterial', {id: this.$route.params.id})
            .then(() => {
              this.submitting = false;
            });
        });

        this.my_checked_collections = collections.slice(0);
      }
    }
  }
};
