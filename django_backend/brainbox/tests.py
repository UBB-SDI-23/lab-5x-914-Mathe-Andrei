from django.test import TestCase
from rest_framework import status
from rest_framework.reverse import reverse

from brainbox.models import *


class TestUsersByCharsWritten(TestCase):
    def setUp(self) -> None:
        self.user1 = User.objects.create(username='mathe13', email='matheandrei13.me@gmail.com', password='123')
        self.user2 = User.objects.create(username='soia26602', email='soi02soia@gmail.com', password='12345678')

        self.file1 = File.objects.create(
            name='Wishlist',
            content='- The Long Dark\n\n- Horizon Zero Dawn\n\n- A Way Out\n\n- Unravel Games\n\n- We Happy Few\n\n- Ancestors: The Humankind Odyssey\n\n- God of War Series\n\n- Tomb Raider Series\n\n- The Witcher Series',
            folder=None,
            user=self.user1
        )
        self.file2 = File.objects.create(
            name='Fish at over',
            content='## Ingredients\n\n- salmon\n- red onion\n- cherry tomatoes\n- salt\n- pepper\n- olive oil\n- white wine\n- garlic powder\n- oregano\n- water\n\n## Instructions\n\n1. wash the salmon and dry it with paper\n2. remove the scales\n3. put it in the tray and grease it with olive oil\n4. sprinkle some garlic powder, salt, pepper and oregano\n5. cut the onion intro strips\n6. cut the tomatoes in half\n7. put them on the salmon\n8. pour white wine and water\n9. cover with aluminium foil\n10. preheat the oven at 180°C for 10 minutes than put the tray in the oven at 170-180°C at least 20-30 minutes. After that uncover the tray and let it a few more minutes\n\n## Notes\n\n- Red pepper and shrimps can be added for flavor',
            folder=None,
            user=self.user2
        )
        self.file3 = File.objects.create(
            name='Banana bread',
            content='**Link:** [https://www.cookingclassy.com/banana-bread-the-perfect-loaf/](https://www.cookingclassy.com/banana-bread-the-perfect-loaf/)\n\n**Servings:** 14 servings\n\n**Ready in:** 1 hour 10 minutes\n\n**Prep**\n10 minutes\n\n> **Cook**\n1 hour\n> \n\n---\n\n## Ingredients\n\n- 236g all purpose flour\n- 1 tsp baking power\n- 1/2 tsp baking soda\n- 1/2 tsp salt\n- 113g unsalted butter (melted)\n- 160g granulated sugar\n- 2 large eggs\n- 325g mashed bananas (3 1/2 medium bananas)\n- 63g sour cream\n- 1/2 tsp vanilla extract (not crucial)\n\n## Video\n\n[Video (1:00 minutes)](https://content.jwplatform.com/videos/eV3ZuCEw.mp4)\n\nVideo (1:00 minutes)\n\n## Instructions\n\n1. Preheat oven to 180°C. Grease a loaf pan.\n2. In a mixing bowl whisk together flour, backing powder, soda and salt. Make a well in center of flour mixture, set aside.\n3. In a separate medium mixing bowl whisk together melted butter and granulated sugar.\n4. Whisk in eggs, then whisk in bananas, sour cream and vanilla.\n5. Pour banana mixture into flour mixture and fold with with rubber spatula just until combines (you shouldn’t see any more streaks of flour). Pour batter into prepared loaf pan.\n6. Bake in preheated oven until toothpick inserted into center comes out free of batter (a moist crumb or two is fine but top should be set), about 50 - 58 minutes.\n7. Cool in pan 10 - 15 minutes. Run knife around edges to loosen then invert onto a wire rack.\n8. Let cool on wire rack about 30 minutes then transfer to an airtight container to finish cooling. Store at room temperature or refrigerate for longer shelf life.\n\n## Notes\n\n- You can adjust the sweetness to suite your taste. I prefer 160g cup sugar, but if you like it really sweet use 213g, if you like it lightly sweetened use 106g cup.\n- Be sure to **use very well ripened spotted bananas** though, because they offer the best flavor and sweetness. **Avoid black bananas** though because they’re usually starting to rot and they don’t have a good flavor.\n- In a pinch, if you don’t have sour cream just add 60g (1/4 cup) more mashed bananas.\n- **Only use real butter.** No shortening, no margarine, no oil.\n- If you only have salted butter on hand, reduce salt in recipe to 1/4 tsp.\n- Once you are folding in the flour **be careful not to over-mix** so you get a nice tall loaf. Just fold until there’s no longer streaks of flour.\n- **Check dates on baking soda and baking power.** If they’re outdated the loaf may not rise the same.\n- **Careful not to over-bake** for a supremely moist loaf.\n- **Serve it the next day if possible.** Banana bread is even better one day after it’s made.',
            folder=None,
            user=self.user2
        )

    def test_statistics(self):
        url = reverse('users-by-chars-written')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        self.assertEqual(response.data[0]['id'], self.user2.id)
        self.assertEqual(response.data[0]['username'], self.user2.username)
        self.assertEqual(response.data[0]['email'], self.user2.email)
        self.assertEqual(response.data[0]['password'], self.user2.password)
        self.assertEqual(response.data[0]['written_chars'], 3282)

        self.assertEqual(response.data[1]['id'], self.user1.id)
        self.assertEqual(response.data[1]['username'], self.user1.username)
        self.assertEqual(response.data[1]['email'], self.user1.email)
        self.assertEqual(response.data[1]['password'], self.user1.password)
        self.assertEqual(response.data[1]['written_chars'], 183)


class TestFoldersByFilesSharedUsers(TestCase):
    def setUp(self) -> None:
        self.user1 = User.objects.create(username='mathe13', email='matheandrei13.me@gmail.com', password='123')
        self.user2 = User.objects.create(username='soia26602', email='soi02soia@gmail.com', password='12345678')

        self.folder1 = Folder.objects.create(name='Personal stuff', user=self.user1, parent_folder=None)
        self.folder2 = Folder.objects.create(name='Cooking', user=self.user2, parent_folder=None)
        self.folder3 = Folder.objects.create(name='Cat food', user=self.user2, parent_folder=self.folder2)

        self.file1 = File.objects.create(
            name='Wishlist',
            content='- The Long Dark\n\n- Horizon Zero Dawn\n\n- A Way Out\n\n- Unravel Games\n\n- We Happy Few\n\n- Ancestors: The Humankind Odyssey\n\n- God of War Series\n\n- Tomb Raider Series\n\n- The Witcher Series',
            folder=self.folder1,
            user=self.user1
        )
        self.file2 = File.objects.create(
            name='Fish at over',
            content='## Ingredients\n\n- salmon\n- red onion\n- cherry tomatoes\n- salt\n- pepper\n- olive oil\n- white wine\n- garlic powder\n- oregano\n- water\n\n## Instructions\n\n1. wash the salmon and dry it with paper\n2. remove the scales\n3. put it in the tray and grease it with olive oil\n4. sprinkle some garlic powder, salt, pepper and oregano\n5. cut the onion intro strips\n6. cut the tomatoes in half\n7. put them on the salmon\n8. pour white wine and water\n9. cover with aluminium foil\n10. preheat the oven at 180°C for 10 minutes than put the tray in the oven at 170-180°C at least 20-30 minutes. After that uncover the tray and let it a few more minutes\n\n## Notes\n\n- Red pepper and shrimps can be added for flavor',
            folder=self.folder2,
            user=self.user2
        )
        self.file3 = File.objects.create(
            name='Banana bread',
            content='**Link:** [https://www.cookingclassy.com/banana-bread-the-perfect-loaf/](https://www.cookingclassy.com/banana-bread-the-perfect-loaf/)\n\n**Servings:** 14 servings\n\n**Ready in:** 1 hour 10 minutes\n\n**Prep**\n10 minutes\n\n> **Cook**\n1 hour\n> \n\n---\n\n## Ingredients\n\n- 236g all purpose flour\n- 1 tsp baking power\n- 1/2 tsp baking soda\n- 1/2 tsp salt\n- 113g unsalted butter (melted)\n- 160g granulated sugar\n- 2 large eggs\n- 325g mashed bananas (3 1/2 medium bananas)\n- 63g sour cream\n- 1/2 tsp vanilla extract (not crucial)\n\n## Video\n\n[Video (1:00 minutes)](https://content.jwplatform.com/videos/eV3ZuCEw.mp4)\n\nVideo (1:00 minutes)\n\n## Instructions\n\n1. Preheat oven to 180°C. Grease a loaf pan.\n2. In a mixing bowl whisk together flour, backing powder, soda and salt. Make a well in center of flour mixture, set aside.\n3. In a separate medium mixing bowl whisk together melted butter and granulated sugar.\n4. Whisk in eggs, then whisk in bananas, sour cream and vanilla.\n5. Pour banana mixture into flour mixture and fold with with rubber spatula just until combines (you shouldn’t see any more streaks of flour). Pour batter into prepared loaf pan.\n6. Bake in preheated oven until toothpick inserted into center comes out free of batter (a moist crumb or two is fine but top should be set), about 50 - 58 minutes.\n7. Cool in pan 10 - 15 minutes. Run knife around edges to loosen then invert onto a wire rack.\n8. Let cool on wire rack about 30 minutes then transfer to an airtight container to finish cooling. Store at room temperature or refrigerate for longer shelf life.\n\n## Notes\n\n- You can adjust the sweetness to suite your taste. I prefer 160g cup sugar, but if you like it really sweet use 213g, if you like it lightly sweetened use 106g cup.\n- Be sure to **use very well ripened spotted bananas** though, because they offer the best flavor and sweetness. **Avoid black bananas** though because they’re usually starting to rot and they don’t have a good flavor.\n- In a pinch, if you don’t have sour cream just add 60g (1/4 cup) more mashed bananas.\n- **Only use real butter.** No shortening, no margarine, no oil.\n- If you only have salted butter on hand, reduce salt in recipe to 1/4 tsp.\n- Once you are folding in the flour **be careful not to over-mix** so you get a nice tall loaf. Just fold until there’s no longer streaks of flour.\n- **Check dates on baking soda and baking power.** If they’re outdated the loaf may not rise the same.\n- **Careful not to over-bake** for a supremely moist loaf.\n- **Serve it the next day if possible.** Banana bread is even better one day after it’s made.',
            folder=self.folder2,
            user=self.user2
        )

        self.sharedfile1 = SharedFile.objects.create(user=self.user2, file=self.file1, permission='R')
        self.sharedfile2 = SharedFile.objects.create(user=self.user1, file=self.file3, permission='RW')

    def test_statistics(self):
        url = reverse('folders-by-shared-users')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        self.assertEqual(response.data[0]['id'], self.folder1.id)
        self.assertEqual(response.data[0]['name'], self.folder1.name)
        self.assertEqual(response.data[0]['user'], self.folder1.user.id)
        self.assertEqual(response.data[0]['parent_folder'], None)
        self.assertEqual(response.data[0]['num_shared_users'], 1)

        self.assertEqual(response.data[1]['id'], self.folder2.id)
        self.assertEqual(response.data[1]['name'], self.folder2.name)
        self.assertEqual(response.data[1]['user'], self.folder2.user.id)
        self.assertEqual(response.data[1]['parent_folder'], None)
        self.assertEqual(response.data[1]['num_shared_users'], 1)

        self.assertEqual(response.data[2]['id'], self.folder3.id)
        self.assertEqual(response.data[2]['name'], self.folder3.name)
        self.assertEqual(response.data[2]['user'], self.folder3.user.id)
        self.assertEqual(response.data[2]['parent_folder'], self.folder3.parent_folder.id)
        self.assertEqual(response.data[2]['num_shared_users'], 0)
