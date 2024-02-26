import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import {CommonStyle, Theme} from '../../Theme';
import {PrimaryButton} from './PrimaryButton';
import ProgressBar from './ProgressBar';
import {Screens} from '../navigation/RootNavigator';
import {useRoute} from '@react-navigation/native';
import {postRecipeImages} from '../api/ApiFilesManager';
import {putRecipe} from '../api/ApiRecipes';
import {Recipe} from './FoodApiInterfaces/interfaces';

const TagsDropdown = ({availableTags, selectedTags, onTagSelect}: any) => {
  const handleTagSelect = (tag: any) => {
    if (!selectedTags.includes(tag)) {
      onTagSelect([...selectedTags, tag]);
    } else {
      const updatedTags = selectedTags.filter(
        (selectedTag: any) => selectedTag !== tag,
      );
      onTagSelect(updatedTags);
    }
  };

  return (
    <View>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 16}}>
        {availableTags.map((tag: any, index: any) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.selectedTag,
              {
                backgroundColor: selectedTags.includes(tag)
                  ? Theme.colors.SECONDARY_2
                  :Theme.colors.NEUTRAL_4,
              },
            ]}
            onPress={() => handleTagSelect(tag)}>
            <Text
              style={{
                color: selectedTags.includes(tag) ? Theme.colors.NEUTRAL_1 : Theme.colors.NEUTRAL_1,
              }}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const EditRecipeScreen4 = ({navigation}: any) => {
  const route: any = useRoute();

  const [calories, setCalories] = useState(0);
  const [proteins, setProteins] = useState(0);
  const [totalFat, setTotalFat] = useState(0);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const availableTags = [
    'Vegana',
    'Apta Celiacos',
    'Rápida Preparación',
    'Estimula el Sistema Inmune',
    'Vegetarianas',
    'Promueve la Flora Intestinal',
    'Baja en Sodio',
    'Baja en Carbohidratos',
    'Antiinflamatoria',
  ];

  const handleTagSelect = (tags: any) => {
    setSelectedTags(tags);
  };
  const submitFormEditRecipe = async () => {
    let editRecipe = {
      title: route.params.step1.title,
      description: route.params.step1.description,
      youtubeLink: route.params.step1.videoLink,
      ingredients: route.params.step2.ingredients,
      portions: route.params.step2.portions,
      preparationTime: route.params.step2.preparationTime,
      steps: route.params.step3.steps,
      images:route.params.step1.images.filter((img: any) => !img.isNew && !img.url.includes('dish-image-no.jpg')),
      nutritionalProperties: {
        calories: calories,
        proteins: proteins,
        totalFat: totalFat,
      },
      tags: selectedTags,
    };
    try {
      let recipe = await putRecipe(route.params.recipe._id, editRecipe);
    
      let newImages = route.params.step1.images.filter((img: any) => img.isNew);
      if (newImages.length > 0){
        await postRecipeImages(recipe._id, newImages.map((img: any) => img.url));
      }
    }catch (error) {
      console.error("Error: ", error);
    }
    navigateToNextScreen();
  };

  useEffect(() => {
    // initial values from recipe
    const recipe: Recipe = route.params.recipe;
    setCalories(recipe?.nutritionalProperties?.calories ?? 0);
    setProteins(recipe?.nutritionalProperties?.proteins ?? 0);
    setTotalFat(recipe?.nutritionalProperties?.totalFat ?? 0);
    setSelectedTags(recipe?.tags ?? []);
  }, [route.params?.recipe]);

  const navigateToNextScreen = () => {
    navigation.navigate(Screens.Landing);
  };

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text style={styles.titleText}>Otros Datos</Text>
          <Text style={styles.subTitleText}>
            Agregá más información para que otros puedan encontrar tu receta
            fácilmente
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Cantidad de calorías"
            keyboardType="numeric"
            defaultValue={calories.toString()}
            onChangeText={newText => {
              newText.replace(/[^0-9]/, '');
              setCalories(Number.parseInt(newText));
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Cantidad de proteínas"
            keyboardType="numeric"
            defaultValue={proteins.toString()}
            onChangeText={newText => {
              newText.replace(/[^0-9]/, '');
              setProteins(Number.parseInt(newText));
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Cantidad de grasas totales"
            keyboardType="numeric"
            defaultValue={totalFat.toString()}
            onChangeText={newText => {
              newText.replace(/[^0-9]/, '');
              setTotalFat(Number.parseInt(newText));
            }}
          />

          <TagsDropdown
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
          />
        </View>
      </ScrollView>
      <View style={{height: 160}}>
        <ProgressBar currentStep={4} />
        <View style={{height: 36}} />
        <PrimaryButton
          text="Finalizar"
          backgroundColor={
            calories && proteins && totalFat
              ? Theme.colors.SECONDARY_2
              : Theme.colors.NEUTRAL_3
          }
          onPress={() => {
            if (calories && proteins && totalFat) submitFormEditRecipe();
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: Theme.colors.PRIMARY_1,
    flex: 1,
    justifyContent: 'space-between', // Asegúrate de que el contenido se distribuya verticalmente
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    padding: 30,
    minWidth: '100%',
  },
  titleText: CommonStyle.titleText,
  subTitleText: CommonStyle.subTitleText,
  input: CommonStyle.input,
  selectedTag: {
    borderRadius: 15,
    padding: 8,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
});

export default EditRecipeScreen4;
